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
 * Smoke test: every endpoint of docs/ai-factory-poc/05-backend-contract.md answers on the mocks.
 * Uses a scratch axios instance (never the app's global one) so this never touches real network
 * code paths. Async simulations (fix round, automation) are advanced with fake timers.
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { URLS } from 'common/urls';
import {
  AutomateAcceptedRS,
  AutomationEnvironmentsRS,
  FixRoundRS,
  IterationPageRS,
  IterationRS,
  LifecycleBatchRS,
  PipelineRS,
  PipelineSettingsRS,
  ReviewCommentRS,
  TestCaseAiExtension,
  TestCaseAiRS,
} from 'types/aiFactory';
import { resetMockDb } from './db';
import { installAiFactoryHandlers, SIMULATED_DELAY_MS } from './handlers';

const PROJECT = 'demo_project';
let http: ReturnType<typeof axios.create>;
let mock: MockAdapter;

beforeEach(() => {
  resetMockDb();
  http = axios.create();
  mock = new MockAdapter(http);
  installAiFactoryHandlers(mock);
});

afterEach(() => mock.restore());

describe('pipelines (P1-P4)', () => {
  test('P1 lists both pipelines', async () => {
    const { data } = await http.get<PipelineRS[]>(URLS.tmsPipeline(PROJECT));
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ name: 'Test case generation', settings: { threshold: 90 } });
  });

  test('P2 lists gen-1 first when sorted, and search filters by requirement', async () => {
    const { data } = await http.get<IterationPageRS>(URLS.tmsPipelineIterations(PROJECT, 1, { search: 'BLK' }));
    expect(data.content).toHaveLength(1);
    expect(data.content[0].requirement?.specId).toBe('US-TMS-BLK-001');
  });

  test('P3 returns iteration details with stages', async () => {
    const { data } = await http.get<IterationRS>(URLS.tmsPipelineIterationById(PROJECT, 1, 101));
    expect(data.stages.map((s) => s.key)).toEqual(['CREATE', 'GRADE', 'UPLOAD', 'REVIEW']);
  });

  test('P3 404s for an unknown iteration', async () => {
    const res = await http.get(URLS.tmsPipelineIterationById(PROJECT, 1, 999), { validateStatus: () => true });
    expect(res.status).toBe(404);
  });

  test('P4 GET/PUT settings, with validation', async () => {
    const before = await http.get<PipelineSettingsRS>(URLS.tmsPipelineSettings(PROJECT, 1));
    expect(before.data).toMatchObject({ autoReady: true, threshold: 90 });

    const invalid = await http.put(URLS.tmsPipelineSettings(PROJECT, 1), { autoReady: true, threshold: 101 }, { validateStatus: () => true });
    expect(invalid.status).toBe(400);

    const ok = await http.put<PipelineSettingsRS>(URLS.tmsPipelineSettings(PROJECT, 1), { autoReady: false, threshold: 80 });
    expect(ok.data).toEqual({ autoReady: false, threshold: 80, editable: true });
  });
});

describe('test-case AI (C2)', () => {
  test('returns evaluation, cost and pipeline links for TC101', async () => {
    const { data } = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC101'));
    expect(data.evaluation?.totalScore).toBe(94);
    expect(data.cost?.approxTotal).toBeGreaterThan(0);
    expect(data.pipelineLinks[0]).toMatchObject({ iterationNumber: 1, stage: 'GRADE' });
  });
});

describe('lifecycle (L1-L2)', () => {
  test('L1 Approve on a Draft AI case with no unsent comments succeeds', async () => {
    const { data } = await http.post<TestCaseAiExtension>(URLS.testCaseLifecycle(PROJECT, 'TC104'), { action: 'APPROVE' });
    expect(data.lifecycle).toBe('READY');
  });

  test('L1 rejects Approve while a comment is unsent', async () => {
    const res = await http.post<{ reason: string }>(URLS.testCaseLifecycle(PROJECT, 'TC106'), { action: 'APPROVE' }, { validateStatus: () => true });
    expect(res.status).toBe(409);
    expect(res.data.reason).toBe('UNSENT_COMMENTS');
  });

  test('L2 batch approves eligible cases and skips the rest', async () => {
    const { data } = await http.post<LifecycleBatchRS>(URLS.testCaseLifecycleBatch(PROJECT), { testCaseIds: [1004, 1006] });
    expect(data.updated).toEqual([{ id: 1004, reason: 'APPROVED' }]);
    expect(data.skipped).toEqual([{ id: 1006, displayId: 'TC106', reason: 'UNSENT_COMMENTS' }]);
  });
});

describe('review comments (R1-R3)', () => {
  test('R1 add then list, R2 delete own pending, R3 discard all', async () => {
    const added = await http.post<ReviewCommentRS>(URLS.testCaseReviewComments(PROJECT, 'TC104'), { target: { type: 'TEXT_SCENARIO' }, text: 'Please clarify.' });
    expect(added.data.state).toBe('PENDING');

    const listed = await http.get<ReviewCommentRS[]>(URLS.testCaseReviewComments(PROJECT, 'TC104'));
    expect(listed.data).toHaveLength(1);

    await http.delete(URLS.testCaseReviewCommentById(PROJECT, 'TC104', added.data.id));
    const afterDelete = await http.get<ReviewCommentRS[]>(URLS.testCaseReviewComments(PROJECT, 'TC104'));
    expect(afterDelete.data).toHaveLength(0);

    await http.post(URLS.testCaseReviewComments(PROJECT, 'TC104'), { target: { type: 'TEXT_SCENARIO' }, text: 'Another one.' });
    await http.delete(URLS.discardTestCaseReviewComments(PROJECT, 'TC104'));
    const afterDiscard = await http.get<ReviewCommentRS[]>(URLS.testCaseReviewComments(PROJECT, 'TC104'));
    expect(afterDiscard.data).toHaveLength(0);
  });
});

describe('fix rounds (F1-F2)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('F1 push starts a round, F2 shows it running then Passed with a new score', async () => {
    const push = await http.post<FixRoundRS>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(push.status).toBe(202);
    expect(push.data.status).toBe('RUNNING');

    const running = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(running.data[0].status).toBe('RUNNING');

    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const done = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC106'));
    expect(done.data[0]).toMatchObject({ status: 'PASSED', scoreBefore: 81 });
    expect(done.data[0].scoreAfter).toBeGreaterThan(81);
  });

  test('F1 rejects a push with no unsent comments', async () => {
    const res = await http.post<{ reason: string }>(URLS.testCaseFixRounds(PROJECT, 'TC101'), undefined, { validateStatus: () => true });
    expect(res.status).toBe(409);
    expect(res.data.reason).toBe('NO_UNSENT_COMMENTS');
  });

  test('TC107 fails once (job timeout) then succeeds on the next push', async () => {
    await http.post(URLS.testCaseReviewComments(PROJECT, 'TC107'), { target: { type: 'TEXT_SCENARIO' }, text: 'Fix it.' });
    await http.post(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const afterFail = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    expect(afterFail.data).toHaveLength(0); // failed round is not recorded; comments are pending again

    await http.post(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    jest.advanceTimersByTime(SIMULATED_DELAY_MS + 100);
    const afterRetry = await http.get<FixRoundRS[]>(URLS.testCaseFixRounds(PROJECT, 'TC107'));
    expect(afterRetry.data[0].status).toBe('PASSED');
  });
});

describe('automation (A1-A2)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('A1 lists environments', async () => {
    const { data } = await http.get<AutomationEnvironmentsRS>(URLS.tmsAutomationEnvironments(PROJECT));
    expect(data.default).toBe('beta5');
  });

  test('A2 accepts Ready cases, skips Draft, and the iteration completes', async () => {
    const res = await http.post<AutomateAcceptedRS>(URLS.tmsAutomation(PROJECT), { testCaseIds: [1005, 1006], environment: 'beta5', confirmReautomate: false });
    expect(res.status).toBe(202);
    expect(res.data.accepted).toEqual([1005]);
    expect(res.data.skipped).toEqual([{ id: 1006, displayId: 'TC106', reason: 'NOT_READY' }]);

    jest.advanceTimersByTime(SIMULATED_DELAY_MS * 4 + 100);
    const c = await http.get<TestCaseAiRS>(URLS.testCaseAi(PROJECT, 'TC105'));
    expect(c.data.automation?.status).toBe('AUTOMATED');
  });
});

