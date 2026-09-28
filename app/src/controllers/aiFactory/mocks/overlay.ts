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
 *
 * **Also deferred, for the same reason:** detecting a real scenario edit (`PUT tms/test-case/{id}`)
 * and turning it into `SCENARIO_CHANGED` (L3 in 05). It needs the same real, seeded AI cases to be
 * meaningful, so it lands together with the seeding work once Q-ORG-07 is answered.
 */

import { AxiosInstance, AxiosResponse } from 'axios';
import { TestCase } from 'types/testCase';
import { TestCaseAiExtension } from 'types/aiFactory';
import { findCase, findIteration, findPipeline, plansBlockedByCase } from './db';
import { toTestCaseAiExtension } from './viewModels';

export const mergeAiFields = (testCase: TestCase): TestCase & Partial<TestCaseAiExtension> => {
  const record = findCase(testCase.displayId);
  if (!record) {
    return testCase; // no matching mock record — the toggle-OFF/no-data guard in components handles this too
  }
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

/** Enriches `GET tms/test-case` (list) and `GET tms/test-case/{id}` (details) responses in place. */
export const installOverlayInterceptor = (http: AxiosInstance): number =>
  http.interceptors.response.use((response: AxiosResponse) => {
    if (!/\/tms\/test-case(\/|\?|$)/.test(response.config.url || '')) {
      return response;
    }
    if (isTestCaseList(response.data)) {
      return { ...response, data: { ...response.data, content: response.data.content.map(mergeAiFields) } };
    }
    if (isTestCase(response.data)) {
      return { ...response, data: mergeAiFields(response.data) };
    }
    return response;
  });
