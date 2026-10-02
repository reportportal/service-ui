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

import axios, { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  AutomationStatus,
  EvaluationState,
  Lifecycle,
  LifecycleActorType,
  LifecycleReason,
  ScenarioUpdateRS,
  TestCaseAiRS,
} from 'types/aiFactory';
import { ManualScenario, TestCase, TestCaseManualScenario } from 'types/testCase';
import { findCase, resetMockDb } from './db';
import { installAiFactoryHandlers } from './handlers';
import {
  C3_OVERLAY_ERROR_CODE,
  installOverlayInterceptor,
  mergeAiFields,
} from './overlay';

const TEST_CASE_URL = '/api/v1/project/demo/tms/test-case/555';

const setupOverlay = () => {
  const http = axios.create();
  const mock = new MockAdapter(http);
  installOverlayInterceptor(http);
  return { http, mock };
};

const originalScenario = (): ManualScenario => ({
  id: 1,
  manualScenarioType: TestCaseManualScenario.STEPS,
  executionEstimationTime: 60,
  requirements: [],
  preconditions: { value: 'The user is logged in' },
  steps: [
    {
      id: 1,
      instructions: 'Open the dashboard',
      expectedResult: 'The dashboard is displayed',
    },
  ],
});

const realTestCase = (
  displayId: string,
  manualScenario?: ManualScenario,
  id = 555,
): TestCase => ({
  id,
  displayId,
  name: 'A real Library case',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  path: ['Some folder'],
  testFolder: { id: 1 },
  manualScenario,
});

beforeEach(() => resetMockDb());

describe('mergeAiFields', () => {
  test('leaves a case untouched when no mock record matches its displayId', () => {
    const real = realTestCase('TC999-not-seeded');
    expect(mergeAiFields(real)).toEqual(real);
  });

  test('merges lifecycle, AI marker and evaluation onto a matching real case (TC106)', () => {
    const real = realTestCase('TC106');
    const merged = mergeAiFields(real);
    expect(merged).toMatchObject({
      id: 555, // the real numeric id is kept — only AI fields are added
      displayId: 'TC106',
      lifecycle: 'DRAFT',
      ai: { modifiedByAgent: false },
      evaluationSummary: { totalScore: 81, state: 'EVALUATED' },
      review: { unsentCommentsCount: 1 },
    });
  });

  test('a Ready case merges with no blockedPlans', () => {
    const merged = mergeAiFields(realTestCase('TC101'));
    expect(merged.lifecycle).toBe('READY');
    expect(merged.blockedPlans).toEqual([]);
  });
});

describe('installOverlayInterceptor', () => {
  test('enriches a test-case details response', async () => {
    const { http, mock } = setupOverlay();
    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC106'));

    const { data } = await http.get<TestCase & { lifecycle?: string }>(TEST_CASE_URL);
    expect(data.lifecycle).toBe('DRAFT');

    mock.restore();
  });

  test('resolves C2 data by the real numeric id after enriching the case by displayId', async () => {
    const { http, mock } = setupOverlay();
    installAiFactoryHandlers(mock);
    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101'));

    const testCase = await http.get<TestCase>(TEST_CASE_URL);
    const { data } = await http.get<TestCaseAiRS>(
      '/api/v1/project/demo/tms/test-case/555/ai',
    );

    expect(testCase.data).toMatchObject({ id: 555, displayId: 'TC101', lifecycle: Lifecycle.READY });
    expect(data).toMatchObject({
      evaluation: { totalScore: 94, state: EvaluationState.EVALUATED },
      lifecycleHistory: expect.arrayContaining([
        expect.objectContaining({ to: Lifecycle.READY, reason: LifecycleReason.AUTO_READY }),
      ]),
    });

    mock.restore();
  });

  test('keeps a real numeric id alias distinct from a similar seeded displayId', async () => {
    const { http, mock } = setupOverlay();
    const collisionUrl = '/api/v1/project/demo/tms/test-case/101';
    installAiFactoryHandlers(mock);
    mock.onGet(collisionUrl).reply(200, realTestCase('TC106', undefined, 101));

    const testCase = await http.get<TestCase>(collisionUrl);
    const { data } = await http.get<TestCaseAiRS>(`${collisionUrl}/ai`);

    expect(testCase.data).toMatchObject({ id: 101, displayId: 'TC106', lifecycle: Lifecycle.DRAFT });
    expect(data).toMatchObject({
      evaluation: { totalScore: 81, state: EvaluationState.EVALUATED },
      lifecycleHistory: [
        expect.objectContaining({ to: Lifecycle.DRAFT, reason: LifecycleReason.UPLOADED }),
      ],
    });
    expect(findCase(101)?.displayId).toBe('TC106');
    expect(findCase('TC101')).toMatchObject({ id: 1001, displayId: 'TC101' });

    mock.restore();
  });

  test('enriches every item of a test-case list response', async () => {
    const { http, mock } = setupOverlay();
    mock.onGet('/api/v1/project/demo/tms/test-case').reply(200, { content: [realTestCase('TC101'), realTestCase('TC106')] });

    const { data } = await http.get<{ content: (TestCase & { lifecycle?: string })[] }>('/api/v1/project/demo/tms/test-case');
    expect(data.content.map((c) => c.lifecycle)).toEqual(['READY', 'DRAFT']);

    mock.restore();
  });

  test('filters a complete first page and recomputes its pagination metadata', async () => {
    const { http, mock } = setupOverlay();
    const url = '/api/v1/project/demo/tms/test-case';
    const content = ['TC101', 'TC103', 'TC105', 'TC106'].map((displayId, index) =>
      realTestCase(displayId, undefined, index + 1),
    );
    mock.onGet(`${url}?offset=0&limit=1000`).reply(200, {
      content,
      page: { number: 1, size: 20, totalElements: 4, totalPages: 1 },
    });

    const { data } = await http.get<{ content: TestCase[]; page: { totalElements: number } }>(url, {
      params: {
        'filter.eq.lifecycle': Lifecycle.DRAFT,
        'filter.eq.ai': true,
        'filter.eq.iterationId': 102,
      },
    });

    expect(data.content.map(({ displayId }) => displayId)).toEqual(['TC106']);
    expect(data.page.totalElements).toBe(1);

    mock.restore();
  });

  test('loads and filters the complete backend dataset before applying pagination', async () => {
    const { http, mock } = setupOverlay();
    const url = '/api/v1/project/demo/tms/test-case';
    mock.onGet(`${url}?limit=1000&offset=0`).reply(200, {
      content: [realTestCase('TC101'), realTestCase('TC103')],
      page: { number: 0, size: 2, totalElements: 8, totalPages: 4 },
    });
    mock.onGet(`${url}?limit=2&offset=2`).reply(200, {
      content: [realTestCase('TC102'), realTestCase('TC104')],
      page: { number: 2, size: 2, totalElements: 8, totalPages: 4 },
    });
    mock.onGet(`${url}?limit=2&offset=4`).reply(200, {
      content: [realTestCase('TC105'), realTestCase('TC106')],
      page: { number: 3, size: 2, totalElements: 8, totalPages: 4 },
    });
    mock.onGet(`${url}?limit=2&offset=6`).reply(200, {
      content: [realTestCase('TC107'), realTestCase('TC108')],
      page: { number: 4, size: 2, totalElements: 8, totalPages: 4 },
    });

    const { data } = await http.get<{ content: TestCase[]; page: { totalElements: number } }>(url, {
      params: { limit: 2, offset: 2, 'filter.eq.lifecycle': Lifecycle.DRAFT },
    });

    expect(data.content.map(({ displayId }) => displayId)).toEqual(['TC106', 'TC107']);
    expect(data.page.totalElements).toBe(5);

    mock.restore();
  });

  test('rejects filtered responses without pagination metadata', async () => {
    const { http, mock } = setupOverlay();
    const url = '/api/v1/project/demo/tms/test-case';
    mock.onGet(`${url}?offset=0&limit=1000`).reply(200, {
      content: [realTestCase('TC101'), realTestCase('TC103')],
    });

    await expect(
      http.get(url, { params: { 'filter.eq.lifecycle': Lifecycle.DRAFT } }),
    ).rejects.toThrow('AI Factory mock requires pagination metadata to filter Test Cases');

    mock.restore();
  });

  test('rejects a filtered response when all declared pages cannot be loaded', async () => {
    const { http, mock } = setupOverlay();
    const url = '/api/v1/project/demo/tms/test-case';
    mock.onGet(`${url}?offset=0&limit=1000`).reply(200, {
      content: [realTestCase('TC101')],
      page: { number: 1, size: 1, totalElements: 3, totalPages: 2 },
    });
    mock.onGet(`${url}?offset=1&limit=1`).reply(200, {
      content: [realTestCase('TC103')],
      page: { number: 2, size: 1, totalElements: 3, totalPages: 2 },
    });

    await expect(
      http.get(url, { params: { 'filter.eq.lifecycle': Lifecycle.DRAFT } }),
    ).rejects.toThrow('AI Factory mock could not load the complete Test Case dataset');

    mock.restore();
  });

  test.each([
    ['record ceiling', 5001, 6],
    ['page ceiling', 11, 11],
  ])('rejects pagination metadata above the development %s', async (_description, totalElements, totalPages) => {
    const { http, mock } = setupOverlay();
    const url = '/api/v1/project/demo/tms/test-case';
    mock.onGet(`${url}?offset=0&limit=1000`).reply(200, {
      content: [realTestCase('TC103')],
      page: { number: 1, size: 1000, totalElements, totalPages },
    });

    await expect(
      http.get(url, { params: { 'filter.eq.lifecycle': Lifecycle.DRAFT } }),
    ).rejects.toMatchObject({
      code: C3_OVERLAY_ERROR_CODE,
      name: 'C3OverlayError',
    });

    mock.restore();
  });

  test.each([
    ['zero limit', { limit: 0 }],
    ['oversized limit', { limit: 1001 }],
    ['negative offset', { offset: -1 }],
    ['oversized offset', { offset: 5001 }],
  ])('rejects unsafe params-object pagination: %s', async (_description, pagination) => {
    const { http, mock } = setupOverlay();

    await expect(
      http.get('/api/v1/project/demo/tms/test-case', {
        params: {
          limit: 20,
          offset: 0,
          'filter.eq.lifecycle': Lifecycle.DRAFT,
          ...pagination,
        },
      }),
    ).rejects.toMatchObject({
      code: C3_OVERLAY_ERROR_CODE,
      name: 'C3OverlayError',
    });
    expect(mock.history.get).toHaveLength(0);

    mock.restore();
  });

  test('propagates the original AbortSignal and stops before the next page after abort', async () => {
    const { http, mock } = setupOverlay();
    const controller = new AbortController();
    const url = '/api/v1/project/demo/tms/test-case';
    let propagatedSignal: AbortSignal | undefined;
    let propagatedAuthorization: unknown;
    let finalPageRequests = 0;
    mock.onGet(`${url}?offset=0&limit=1000`).reply(200, {
      content: [realTestCase('TC101')],
      page: { number: 1, size: 1, totalElements: 3, totalPages: 3 },
    });
    mock.onGet(`${url}?offset=1&limit=1`).reply((config) => {
      propagatedSignal = config.signal as AbortSignal;
      propagatedAuthorization = AxiosHeaders.from(config.headers).get('Authorization');
      controller.abort();
      return [200, {
        content: [realTestCase('TC103')],
        page: { number: 2, size: 1, totalElements: 3, totalPages: 3 },
      }];
    });
    mock.onGet(`${url}?offset=2&limit=1`).reply(() => {
      finalPageRequests += 1;
      return [200, {
        content: [realTestCase('TC104')],
        page: { number: 3, size: 1, totalElements: 3, totalPages: 3 },
      }];
    });

    await expect(
      http.get(url, {
        params: { 'filter.eq.lifecycle': Lifecycle.DRAFT },
        headers: { Authorization: 'Bearer demo-token' },
        signal: controller.signal,
      }),
    ).rejects.toBeDefined();
    expect(propagatedSignal).toBe(controller.signal);
    expect(propagatedAuthorization).toBe('Bearer demo-token');
    expect(finalPageRequests).toBe(0);

    mock.restore();
  });

  test('overrides only metadata for the dedicated review-queue count request', async () => {
    const { http, mock } = setupOverlay();
    const url =
      '/api/v1/project/demo/tms/test-case?limit=1&offset=0&filter.eq.lifecycle=DRAFT&filter.eq.ai=true';
    mock.onGet('/api/v1/project/demo/tms/test-case?limit=1&offset=0').reply(200, {
      content: [realTestCase('TC101')],
      page: { number: 1, size: 1, totalElements: 37, totalPages: 37 },
    });

    const { data } = await http.get<{
      content: (TestCase & { lifecycle?: Lifecycle })[];
      page: { totalElements: number; totalPages: number };
    }>(url);

    expect(data.content).toHaveLength(1);
    expect(data.content[0]).toMatchObject({ displayId: 'TC101', lifecycle: Lifecycle.READY });
    expect(data.page).toMatchObject({ totalElements: 5, totalPages: 5 });
    expect(mock.history.get[0].url).not.toContain('filter.eq.lifecycle');
    expect(mock.history.get[0].url).not.toContain('filter.eq.ai');

    mock.restore();
  });

  test('does not override metadata for a scoped review-queue request', async () => {
    const { http, mock } = setupOverlay();
    const url =
      '/api/v1/project/demo/tms/test-case?limit=1&filter.eq.lifecycle=DRAFT&filter.eq.ai=true&filter.eq.testFolderId=42';
    mock
      .onGet(
        '/api/v1/project/demo/tms/test-case?limit=1000&filter.eq.testFolderId=42&offset=0',
      )
      .reply(200, {
      content: [realTestCase('TC106')],
        page: { number: 1, size: 1, totalElements: 1, totalPages: 1 },
      });

    const { data } = await http.get<{ page: { totalElements: number } }>(url);

    expect(data.page.totalElements).toBe(1);

    mock.restore();
  });

  test('leaves unrelated endpoints alone', async () => {
    const { http, mock } = setupOverlay();
    mock.onGet('/api/v1/project/demo/tms/milestone').reply(200, { content: [] });

    const { data } = await http.get('/api/v1/project/demo/tms/milestone');
    expect(data).toEqual({ content: [] });

    mock.restore();
  });

  test('demotes a cached Ready case when a scenario field changes', async () => {
    const { http, mock } = setupOverlay();
    const before = originalScenario();
    const after = {
      ...before,
      steps: [
        {
          ...before.steps[0],
          expectedResult: 'The updated dashboard is displayed',
        },
      ],
    };
    const record = findCase('TC101');
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101', before));
    mock.onPut(TEST_CASE_URL).reply(200, realTestCase('TC101', after));

    await http.get(TEST_CASE_URL);
    const { data } = await http.put<TestCase & ScenarioUpdateRS>(TEST_CASE_URL, {
      manualScenario: after,
    });

    expect(data).toMatchObject({
      lifecycleChanged: 'TO_DRAFT',
      lifecycle: Lifecycle.DRAFT,
      evaluationSummary: { state: EvaluationState.OBSOLETE },
      automation: { status: AutomationStatus.AUTOMATED },
    });
    expect(record?.automation?.scenarioChangedAfterAutomation).toBe(true);
    expect(record?.lifecycleHistory).toHaveLength((historyLength ?? 0) + 1);
    expect(record?.lifecycleHistory.at(-1)).toMatchObject({
      from: Lifecycle.READY,
      to: Lifecycle.DRAFT,
      reason: LifecycleReason.SCENARIO_CHANGED,
      actor: { type: LifecycleActorType.USER, name: 'You' },
    });

    mock.restore();
  });

  test('does not mutate lifecycle state when the submitted scenario is unchanged', async () => {
    const { http, mock } = setupOverlay();
    const scenario = originalScenario();
    const record = findCase('TC101');
    const lifecycleBefore = record?.lifecycle;
    const evaluationStateBefore = record?.evaluation?.state;
    const automationStaleBefore = record?.automation?.scenarioChangedAfterAutomation;
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));
    mock.onPut(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));

    await http.get(TEST_CASE_URL);
    const { data } = await http.put<TestCase & ScenarioUpdateRS>(TEST_CASE_URL, {
      manualScenario: scenario,
    });

    expect(data.lifecycleChanged).toBeNull();
    expect(record).toMatchObject({
      lifecycle: lifecycleBefore,
      evaluation: { state: evaluationStateBefore },
      automation: { scenarioChangedAfterAutomation: automationStaleBefore },
    });
    expect(record?.lifecycleHistory).toHaveLength(historyLength ?? 0);

    mock.restore();
  });

  test('does not mutate lifecycle state for a metadata-only update', async () => {
    const { http, mock } = setupOverlay();
    const scenario = originalScenario();
    const record = findCase('TC101');
    const lifecycleBefore = record?.lifecycle;
    const evaluationStateBefore = record?.evaluation?.state;
    const automationStaleBefore = record?.automation?.scenarioChangedAfterAutomation;
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));
    mock.onPut(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));

    await http.get(TEST_CASE_URL);
    const { data } = await http.put<TestCase & ScenarioUpdateRS>(TEST_CASE_URL, {
      priority: 'low',
    });

    expect(data.lifecycleChanged).toBeNull();
    expect(record).toMatchObject({
      lifecycle: lifecycleBefore,
      evaluation: { state: evaluationStateBefore },
      automation: { scenarioChangedAfterAutomation: automationStaleBefore },
    });
    expect(record?.lifecycleHistory).toHaveLength(historyLength ?? 0);

    mock.restore();
  });

  test.each([
    ['an array', { manualScenario: [] }],
    [
      'a step with non-text content',
      {
        manualScenario: {
          manualScenarioType: TestCaseManualScenario.STEPS,
          steps: [{ instructions: 123, expectedResult: 'Displayed' }],
        },
      },
    ],
  ])('does not mutate lifecycle state for valid JSON containing %s', async (_description, payload) => {
    const { http, mock } = setupOverlay();
    const scenario = originalScenario();
    const record = findCase('TC101');
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));
    mock.onPut(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));

    await http.get(TEST_CASE_URL);
    const { data } = await http.put<TestCase & ScenarioUpdateRS>(
      TEST_CASE_URL,
      JSON.stringify(payload),
    );

    expect(data.lifecycleChanged).toBeNull();
    expect(record).toMatchObject({
      lifecycle: Lifecycle.READY,
      evaluation: { state: EvaluationState.EVALUATED },
      automation: { scenarioChangedAfterAutomation: false },
    });
    expect(record?.lifecycleHistory).toHaveLength(historyLength ?? 0);

    mock.restore();
  });

  test('does not throw or mutate lifecycle state when the update URL has malformed encoding', async () => {
    const { http, mock } = setupOverlay();
    const scenario = originalScenario();
    const changedScenario = {
      ...scenario,
      instructions: 'This change must be ignored without a decodable case id',
    };
    const malformedUrl = '/api/v1/project/demo/tms/test-case/%E0%A4%A';
    const record = findCase('TC101');
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC101', scenario));
    mock.onPut(malformedUrl).reply(200, realTestCase('TC101', changedScenario));

    await http.get(TEST_CASE_URL);
    const response = await http.put<TestCase & ScenarioUpdateRS>(malformedUrl, {
      manualScenario: changedScenario,
    });

    expect(response.data.lifecycleChanged).toBeNull();
    expect(record).toMatchObject({
      lifecycle: Lifecycle.READY,
      evaluation: { state: EvaluationState.EVALUATED },
      automation: { scenarioChangedAfterAutomation: false },
    });
    expect(record?.lifecycleHistory).toHaveLength(historyLength ?? 0);

    mock.restore();
  });

  test('records scenario-change effects without reporting a transition for an already-Draft case', async () => {
    const { http, mock } = setupOverlay();
    const before = originalScenario();
    const after = { ...before, preconditions: { value: 'The user is an administrator' } };
    const record = findCase('TC103');
    const historyLength = record?.lifecycleHistory.length;

    mock.onGet(TEST_CASE_URL).reply(200, realTestCase('TC103', before));
    mock.onPut(TEST_CASE_URL).reply(200, realTestCase('TC103', after));

    await http.get(TEST_CASE_URL);
    const { data } = await http.put<TestCase & ScenarioUpdateRS>(TEST_CASE_URL, {
      manualScenario: after,
    });

    expect(data).toMatchObject({
      lifecycleChanged: null,
      lifecycle: Lifecycle.DRAFT,
      evaluationSummary: { state: EvaluationState.OBSOLETE },
    });
    expect(record?.lifecycleHistory).toHaveLength((historyLength ?? 0) + 1);
    expect(record?.lifecycleHistory.at(-1)).toMatchObject({
      from: Lifecycle.DRAFT,
      to: Lifecycle.DRAFT,
      reason: LifecycleReason.SCENARIO_CHANGED,
      actor: { type: LifecycleActorType.USER, name: 'You' },
    });

    mock.restore();
  });
});
