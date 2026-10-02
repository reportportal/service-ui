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

import axios from 'axios';
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
import { installOverlayInterceptor, mergeAiFields } from './overlay';

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
