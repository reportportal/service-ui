/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { isEmpty } from 'es-toolkit/compat';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { uniqueId } from 'common/utils/uniqueId';
import { Attribute, Requirement, TestCase } from 'types/testCase';

const findExistingTag = async (projectKey: string, tag: Attribute): Promise<Attribute | null> => {
  try {
    const { content = [] } = await fetch<{ content?: Attribute[] }>(
      URLS.tmsAttributes(projectKey, { 'filter.eq.key': tag.key }),
    );

    return (
      content.find(({ key, value }) => key === tag.key && (value ?? '') === (tag.value ?? '')) ??
      null
    );
  } catch {
    return null;
  }
};

// New tags carry negative client ids. A tag that cannot be created (e.g. a colleague created the
// same key meanwhile) is resolved to the existing one; only a tag that cannot be found is skipped,
// so one tag never fails the whole test case save.
export const createNewTags = async (
  projectKey: string,
  attributes: Attribute[] = [],
): Promise<Attribute[]> => {
  const newTags = attributes.filter(({ id }) => id < 0);
  const existingTags = attributes.filter(({ id }) => id >= 0);

  if (isEmpty(newTags)) {
    return attributes;
  }

  if (!projectKey) {
    return existingTags;
  }

  const createdTags = await Promise.all(
    newTags.map(async (tag) => {
      try {
        return await fetch<Attribute>(URLS.createTmsAttribute(projectKey), {
          method: 'POST',
          data: { key: tag.key, value: tag.value },
        });
      } catch {
        return findExistingTag(projectKey, tag);
      }
    }),
  );

  return [...existingTags, ...createdTags.filter((tag): tag is Attribute => tag !== null)];
};

interface TestCaseRequestData {
  manualScenario?: { requirements?: Requirement[] };
}

// The backend answers 409 (ErrorRS 409xx) when a requirement id minted in the browser already
// belongs to another scenario.
const isConflictError = (error: unknown) =>
  String((error as { errorCode?: number } | null)?.errorCode ?? '').startsWith('409');

const getPersistedRequirementIds = async (
  projectKey: string,
  testCaseId?: number,
): Promise<Set<string>> => {
  if (!testCaseId) {
    return new Set();
  }

  const testCase = await fetch<TestCase>(URLS.testCaseDetails(projectKey, String(testCaseId)));

  return new Set((testCase.manualScenario?.requirements ?? []).map(({ id }) => String(id)));
};

// Sends the create/update request; on a 409 it regenerates the ids of requirements that are not
// stored for this test case yet and retries once.
export const saveTestCaseWithRequirementRetry = async <T, D extends TestCaseRequestData>({
  url,
  method,
  data,
  projectKey,
  testCaseId,
}: {
  url: string;
  method: 'POST' | 'PUT';
  data: D;
  projectKey: string;
  testCaseId?: number;
}): Promise<T> => {
  try {
    return await fetch<T>(url, { method, data });
  } catch (error) {
    const requirements = data.manualScenario?.requirements ?? [];

    if (!isConflictError(error) || isEmpty(requirements)) {
      throw error;
    }

    const persistedIds =
      method === 'PUT' ? await getPersistedRequirementIds(projectKey, testCaseId) : new Set();
    const regenerated = requirements.map((requirement) =>
      persistedIds.has(String(requirement.id)) ? requirement : { ...requirement, id: uniqueId() },
    );

    if (regenerated.every((requirement, index) => requirement === requirements[index])) {
      throw error;
    }

    return fetch<T>(url, {
      method,
      data: { ...data, manualScenario: { ...data.manualScenario, requirements: regenerated } },
    });
  }
};
