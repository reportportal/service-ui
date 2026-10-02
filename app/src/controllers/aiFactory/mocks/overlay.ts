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

/**
 * Mode A ("Overlay") of docs/ai-factory-poc/03-frontend-architecture.md §4.2: merges the mock
 * AI/lifecycle fields (C1 in 05-backend-contract.md) into real TMS test-case responses, by
 * `displayId`, instead of mocking `tms/test-case` itself.
 *
 * **Scope of this file today:** the merge function and its unit test are real and used by
 * `index.ts`. Actually *seeding* AI cases into a real project (creating them via
 * `tms/test-case/batch` and registering them in the mock db) is not wired up yet — it writes to
 * a shared dev backend, and the target project/folder is still an open question (Q-ORG-07 in
 * docs/ai-factory-poc/06-open-questions.md). Until it is answered, the overlay only enriches
 * responses for cases whose `displayId` already exists in the mock db (the seed's TC101…TC108 —
 * present only once someone creates cases with those names in the target project).
 */

import { AxiosInstance, AxiosResponse } from 'axios';
import { ScenarioUpdateRS, TestCaseAiExtension } from 'types/aiFactory';
import { TestCase, TestCaseManualScenario } from 'types/testCase';
import {
  findCase,
  findIteration,
  findPipeline,
  plansBlockedByCase,
  recordScenarioChange,
  registerCaseAlias,
} from './db';
import { toTestCaseAiExtension } from './viewModels';

type ScenarioFields = {
  manualScenarioType: TestCaseManualScenario;
  precondition: string;
  steps: { instructions: string; expectedResult: string }[];
  instructions: string;
  expectedResult: string;
};

type ScenarioUpdatePayload = {
  manualScenario?: unknown;
};

export const mergeAiFields = (testCase: TestCase): TestCase & Partial<TestCaseAiExtension> => {
  const record = findCase(testCase.displayId);
  if (!record) {
    return testCase; // no matching mock record — the toggle-OFF/no-data guard in components handles this too
  }
  registerCaseAlias(testCase.id, record);
  const iteration = record.ai ? findIteration(record.ai.iterationId) : undefined;
  const pipeline = iteration ? findPipeline(iteration.pipelineId) : undefined;
  return {
    ...testCase,
    ...toTestCaseAiExtension(record, pipeline, iteration),
    blockedPlans: plansBlockedByCase(record.id).map((p) => ({ id: p.id, name: p.name })),
  };
};

const isTestCaseList = (data: unknown): data is { content: TestCase[] } =>
  Boolean(data) && Array.isArray((data as { content?: unknown }).content);

const isTestCase = (data: unknown): data is TestCase =>
  Boolean(data) && typeof (data as TestCase).displayId === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasInvalidText = (value: unknown): boolean => value != null && typeof value !== 'string';

const isScenarioStep = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && !hasInvalidText(value.instructions) && !hasInvalidText(value.expectedResult);

const toScenarioSteps = (value: unknown): ScenarioFields['steps'] | undefined => {
  if (!Array.isArray(value) || !value.every(isScenarioStep)) {
    return undefined;
  }
  return value.map((step) => ({
    instructions: (step.instructions as string | undefined) ?? '',
    expectedResult: (step.expectedResult as string | undefined) ?? '',
  }));
};

const toScenarioFields = (value: unknown): ScenarioFields | undefined => {
  if (!isRecord(value)) return undefined;
  const type = value.manualScenarioType;
  const isText = type === TestCaseManualScenario.TEXT;
  if (!isText && type !== TestCaseManualScenario.STEPS) return undefined;
  if (value.preconditions != null && !isRecord(value.preconditions)) return undefined;
  const precondition = isRecord(value.preconditions) ? value.preconditions.value : undefined;
  const steps = toScenarioSteps(value.steps ?? []);
  if (!steps || [precondition, value.instructions, value.expectedResult].some(hasInvalidText)) {
    return undefined;
  }
  return {
    manualScenarioType: type,
    precondition: (precondition as string | undefined) ?? '',
    steps,
    instructions: (value.instructions as string | undefined) ?? '',
    expectedResult: (value.expectedResult as string | undefined) ?? '',
  };
};

const parsePayload = (data: unknown): ScenarioUpdatePayload => {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return isRecord(parsed) ? { manualScenario: parsed.manualScenario } : {};
  } catch {
    return {};
  }
};

const isScenarioChanged = (before?: ScenarioFields, after?: ScenarioFields): boolean =>
  Boolean(before && after && JSON.stringify(before) !== JSON.stringify(after));

const testCaseKeyFromUrl = (response: AxiosResponse): string | undefined =>
  response.config.url?.match(/\/tms\/test-case\/([^/?]+)(?:\?|$)/)?.[1];

const decodeCaseKey = (key?: string): string | undefined => {
  try {
    return key === undefined ? undefined : decodeURIComponent(key);
  } catch {
    return undefined;
  }
};

const rememberScenario = (scenarios: Map<string, ScenarioFields>, testCase: TestCase): void => {
  const scenario = toScenarioFields(testCase.manualScenario);
  if (!scenario) {
    return;
  }
  scenarios.set(String(testCase.id), scenario);
  scenarios.set(testCase.displayId, scenario);
};

const mergeUpdatedTestCase = (
  response: AxiosResponse,
  testCase: TestCase,
  scenarios: Map<string, ScenarioFields>,
): AxiosResponse => {
  const isUpdate = response.config.method?.toLowerCase() === 'put';
  const key = decodeCaseKey(testCaseKeyFromUrl(response));
  const before = key ? scenarios.get(key) : undefined;
  const after = toScenarioFields(parsePayload(response.config.data).manualScenario);
  const record = findCase(testCase.displayId);
  const lifecycleChanged: ScenarioUpdateRS['lifecycleChanged'] =
    isUpdate && record && isScenarioChanged(before, after) && recordScenarioChange(record)
      ? 'TO_DRAFT'
      : null;
  rememberScenario(scenarios, testCase);
  const data = mergeAiFields(testCase);
  return { ...response, data: isUpdate ? { ...data, lifecycleChanged } : data };
};

/** Enriches `GET tms/test-case` (list) and `GET tms/test-case/{id}` (details) responses in place. */
export const installOverlayInterceptor = (http: AxiosInstance): number => {
  const scenarios = new Map<string, ScenarioFields>();

  return http.interceptors.response.use((response: AxiosResponse) => {
    if (!/\/tms\/test-case(\/|\?|$)/.test(response.config.url || '')) {
      return response;
    }
    if (isTestCaseList(response.data)) {
      response.data.content.forEach((testCase) => rememberScenario(scenarios, testCase));
      return { ...response, data: { ...response.data, content: response.data.content.map(mergeAiFields) } };
    }
    if (isTestCase(response.data)) {
      return mergeUpdatedTestCase(response, response.data, scenarios);
    }
    return response;
  });
};
