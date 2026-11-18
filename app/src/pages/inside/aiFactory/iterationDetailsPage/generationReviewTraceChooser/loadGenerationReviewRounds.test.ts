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

import { getLiveFixTraceTarget } from 'pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget';
import { getLiveLibraryCases } from 'pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases';
import {
  loadLiveFixRoundHistory,
  type NativeFixRound,
} from 'pages/inside/aiFactory/review/liveFixRounds';
import { loadGenerationReviewRounds } from './loadGenerationReviewRounds';

jest.mock('pages/inside/aiFactory/common/stageTrace/liveFixTraceTarget', () => ({
  getLiveFixTraceTarget: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/iterationDetailsPage/liveReviewCases/liveLibraryCases', () => ({
  getLiveLibraryCases: jest.fn(),
}));
jest.mock('pages/inside/aiFactory/review/liveFixRounds', () => ({
  loadLiveFixRoundHistory: jest.fn(),
}));
const testCase = { id: 42, displayId: 'TC1', name: 'Case' };
const source = { sourcePipelineId: 88, sourceIterationId: 31 };
const signal = new AbortController().signal;
const round: NativeFixRound = {
  id: 123,
  testCaseId: 42,
  roundNumber: 9,
  status: 'FAILED',
  previousIterationId: 31,
  resultIterationId: 72,
};
const target = { id: 72, pipelineId: 88, number: 3, stageKey: 'test-case-fix' };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getLiveLibraryCases).mockResolvedValue([{ displayId: 'TC1', testCase }]);
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([round]);
  jest.mocked(getLiveFixTraceTarget).mockResolvedValue(target);
});

test('keeps every matching round in backend order, including a failed result and a timeout without a result', async () => {
  const timeout = { ...round, id: 124, roundNumber: 10, resultIterationId: undefined };
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([timeout, round]);
  const result = await loadGenerationReviewRounds('demo', ['TC1'], source, signal);
  expect(result).toEqual({
    rounds: [
      { ...timeout, roundId: 124, displayId: 'TC1' },
      {
        ...round,
        roundId: 123,
        displayId: 'TC1',
        iterationId: 72,
        pipelineId: 88,
        stageKey: 'test-case-fix',
      },
    ],
    incomplete: false,
  });
  expect(loadLiveFixRoundHistory).toHaveBeenCalledWith('demo', 42, signal);
  expect(getLiveFixTraceTarget).toHaveBeenCalledTimes(1);
});

test.each([undefined, 99])(
  'requires an explicit matching source iteration (%s)',
  async (previousIterationId) => {
    jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([{ ...round, previousIterationId }]);
    await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
      rounds: [],
      incomplete: false,
    });
    expect(getLiveFixTraceTarget).not.toHaveBeenCalled();
  },
);

test.each([
  { ...target, pipelineId: 999 },
  { ...target, id: 31 },
  { ...target, rerunOf: { id: 99 } },
  undefined,
])('retains the round but does not expose an unverified result trace %#', async (resultTarget) => {
  jest.mocked(getLiveFixTraceTarget).mockResolvedValue(resultTarget);
  const result = await loadGenerationReviewRounds('demo', ['TC1'], source, signal);
  expect(result.incomplete).toBe(true);
  expect(result.rounds).toEqual([
    { ...round, roundId: 123, displayId: 'TC1', traceUnavailable: true },
  ]);
});

test('deduplicates repeated cases and shared result reads without conflating per-case round numbers', async () => {
  jest
    .mocked(loadLiveFixRoundHistory)
    .mockResolvedValue([round, { ...round, id: 125, roundNumber: 8 }]);
  const result = await loadGenerationReviewRounds('demo', ['TC1', 'TC1'], source, signal);
  expect(getLiveLibraryCases).toHaveBeenCalledTimes(1);
  expect(loadLiveFixRoundHistory).toHaveBeenCalledTimes(1);
  expect(getLiveFixTraceTarget).toHaveBeenCalledTimes(1);
  expect(result.rounds.map(({ roundId }) => roundId)).toEqual([123, 125]);
});

test('distinguishes history access failure and unresolved cases from a successful empty history', async () => {
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([]);
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: false,
  });
  jest.mocked(loadLiveFixRoundHistory).mockRejectedValue(new Error('Forbidden'));
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: true,
  });
  jest.mocked(getLiveLibraryCases).mockResolvedValue([{ displayId: 'TC1', testCase: null }]);
  await expect(loadGenerationReviewRounds('demo', ['TC1'], source, signal)).resolves.toEqual({
    rounds: [],
    incomplete: true,
  });
});

test('does not read histories after cancellation', async () => {
  const controller = new AbortController();
  controller.abort();
  await loadGenerationReviewRounds('demo', ['TC1'], source, controller.signal);
  expect(loadLiveFixRoundHistory).not.toHaveBeenCalled();
  expect(getLiveFixTraceTarget).not.toHaveBeenCalled();
});
