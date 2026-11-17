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

import { fetch } from 'common/utils';
import { getLiveFixTraceTarget } from 'pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget';
import { getLiveLibraryCases } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import { loadLiveFixRound } from 'pages/inside/aiFactory/review/liveFixRounds';
import { normalizeLiveReview } from 'pages/inside/aiFactory/review/liveReviewComments';

import { loadGenerationReviewRounds } from './loadGenerationReviewRounds';

jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget', () => ({
  getLiveFixTraceTarget: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases', () => ({
  getLiveLibraryCases: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/review/liveFixRounds', () => ({ loadLiveFixRound: jest.fn() }));
jest.mock('pages/inside/aiFactory/review/liveReviewComments', () => ({
  normalizeLiveReview: jest.fn(),
}));

const testCase = { id: 42, displayId: 'TC1', name: 'Case' };
const source = { sourcePipelineId: 88, sourceIterationId: 31 };
const signal = new AbortController().signal;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getLiveLibraryCases).mockResolvedValue([{ displayId: 'TC1', testCase }]);
  (
    fetch as jest.MockedFunction<
      (url: string, options?: Record<string, unknown>) => Promise<unknown>
    >
  ).mockResolvedValue({});
  jest.mocked(normalizeLiveReview).mockReturnValue({
    comments: [],
    unsentCount: 0,
    fixInProgress: false,
    fixRound: 9,
    fixRoundId: 123,
  });
  jest.mocked(loadLiveFixRound).mockResolvedValue({
    id: 123,
    testCaseId: 42,
    roundNumber: 9,
    status: 'FIXED',
    previousIterationId: 31,
    resultIterationId: 72,
  });
  jest
    .mocked(getLiveFixTraceTarget)
    .mockResolvedValue({ id: 72, pipelineId: 88, number: 3, stageKey: 'test-case-fix' });
});

test('offers a round with verified source iteration and result pipeline, never deriving IDs from ordinals', async () => {
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [
      {
        testCaseId: 42,
        displayId: 'TC1',
        roundId: 123,
        roundNumber: 9,
        iterationId: 72,
        pipelineId: 88,
        stageKey: 'test-case-fix',
      },
    ],
    incomplete: false,
  });
  expect(loadLiveFixRound).toHaveBeenCalledWith('demo', 42, 123, signal);
  expect(getLiveFixTraceTarget).toHaveBeenCalledWith('demo', 72, signal);
});

test('does not invent a round ID from its ordinal', async () => {
  jest
    .mocked(normalizeLiveReview)
    .mockReturnValue({ comments: [], unsentCount: 0, fixInProgress: false, fixRound: 9 });
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
  expect(loadLiveFixRound).not.toHaveBeenCalled();
});

test('does not link the source iteration while result is pending', async () => {
  jest.mocked(loadLiveFixRound).mockResolvedValue({
    id: 123,
    testCaseId: 42,
    roundNumber: 9,
    status: 'PENDING',
    previousIterationId: 31,
  });
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
  expect(getLiveFixTraceTarget).not.toHaveBeenCalled();
});

test('reports unresolved cases and request failures without hiding resolvable rounds', async () => {
  jest.mocked(getLiveLibraryCases).mockResolvedValue([
    { displayId: 'TC1', testCase },
    { displayId: 'TC2', testCase: null },
  ]);
  expect(
    (await loadGenerationReviewRounds('demo', ['TC1', 'TC2'], source, signal)).incomplete,
  ).toBe(true);
  jest.mocked(fetch).mockRejectedValue(new Error('Forbidden'));
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: true,
  });
});

test('skips the same case current round when its source is a different iteration', async () => {
  jest.mocked(loadLiveFixRound).mockResolvedValue({
    id: 123,
    testCaseId: 42,
    roundNumber: 9,
    status: 'FIXED',
    previousIterationId: 99,
    resultIterationId: 72,
  });
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
  expect(getLiveFixTraceTarget).not.toHaveBeenCalled();
});

test('skips a round whose result belongs to another pipeline', async () => {
  jest
    .mocked(getLiveFixTraceTarget)
    .mockResolvedValue({ id: 72, pipelineId: 999, number: 3, stageKey: 'test-case-fix' });
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
});

test('skips an absent source reference without guessing lineage', async () => {
  jest.mocked(loadLiveFixRound).mockResolvedValue({
    id: 123,
    testCaseId: 42,
    roundNumber: 9,
    status: 'FIXED',
    resultIterationId: 72,
  });
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
  expect(getLiveFixTraceTarget).not.toHaveBeenCalled();
});

test.each([31, 99])(
  'requires supplied result rerunOf to match the source (rerunOf=%s)',
  async (id) => {
    jest
      .mocked(getLiveFixTraceTarget)
      .mockResolvedValue({
        id: 72,
        pipelineId: 88,
        number: 3,
        stageKey: 'test-case-fix',
        rerunOf: { id },
      });
    const result = await loadGenerationReviewRounds('demo', ['TC1'], source, signal);
    expect(result.rounds).toHaveLength(id === source.sourceIterationId ? 1 : 0);
  },
);
