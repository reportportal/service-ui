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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export type NativeFixRoundStatus = 'PENDING' | 'FIXED' | 'FIXED_GRADE_FAILED' | 'FAILED';
export type FixStartError = 'CONFLICT' | 'FAILED' | 'UNCONFIRMED';

export interface NativeFixRound {
  id: number;
  testCaseId: number;
  roundNumber: number;
  status: NativeFixRoundStatus;
  previousIterationId?: number;
  resultIterationId?: number;
  requestedAt?: string;
  workflowUrl?: string;
  failureReason?: string;
}

export class LiveFixRoundError extends Error {
  readonly reason: FixStartError | 'MISSING';

  constructor(reason: FixStartError | 'MISSING') {
    super(reason);
    this.name = 'LiveFixRoundError';
    this.reason = reason;
  }
}

const invalidRound = (): never => {
  throw new Error('Invalid native fix round response');
};
const isPositiveId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const optionalId = (value: unknown): number | undefined => {
  if (value == null) return undefined;
  return isPositiveId(value) ? value : invalidRound();
};
const optionalText = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  return typeof value === 'string' ? value : invalidRound();
};
const readWorkflowUrl = (value: unknown): string | undefined => {
  const text = optionalText(value);
  if (text === undefined) return undefined;
  const url = new URL(text);
  return ['https:', 'http:'].includes(url.protocol) ? text : invalidRound();
};
const readRequestedAt = (value: unknown): string | undefined => {
  const text = optionalText(value);
  if (text === undefined) return undefined;
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
  if (!iso.test(text) || !Number.isFinite(Date.parse(text))) return invalidRound();
  const date = text.slice(0, 10);
  return new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date ? text : invalidRound();
};

export const normalizeLiveFixRound = (
  value: unknown,
  testCaseId: number,
  expectedId?: number,
): NativeFixRound => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return invalidRound();
  const round = value as Record<string, unknown>;
  if (!isPositiveId(round.id) || !isPositiveId(round.roundNumber)) return invalidRound();
  if (round.testCaseId !== testCaseId || !isPositiveId(round.testCaseId)) return invalidRound();
  if (expectedId !== undefined && round.id !== expectedId) return invalidRound();
  if (typeof round.status !== 'string' ||
    !['PENDING', 'FIXED', 'FIXED_GRADE_FAILED', 'FAILED'].includes(round.status))
    return invalidRound();
  return {
    id: round.id,
    testCaseId: round.testCaseId,
    roundNumber: round.roundNumber,
    status: round.status as NativeFixRoundStatus,
    previousIterationId: optionalId(round.previousIterationId),
    resultIterationId: optionalId(round.resultIterationId),
    requestedAt: readRequestedAt(round.requestedAt),
    workflowUrl: readWorkflowUrl(round.workflowUrl),
    failureReason: optionalText(round.failureReason),
  };
};

const isConflict = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'errorCode' in error && error.errorCode === 40915;

export const startLiveFixRound = async (
  projectKey: string,
  testCaseId: number,
  signal: AbortSignal,
): Promise<NativeFixRound> => {
  try {
    const response = await fetch<unknown>(URLS.liveTestCaseFixRounds(projectKey, testCaseId), {
      method: 'POST',
      signal,
      validateStatus: (status) =>
        (status >= 200 && status < 300) || [400, 403, 404, 409, 422].includes(status),
    }, true);
    if (response.status === 409) throw new LiveFixRoundError('CONFLICT');
    if (response.status >= 400) throw new LiveFixRoundError('FAILED');
    return normalizeLiveFixRound(response.data, testCaseId);
  } catch (error: unknown) {
    if (error instanceof LiveFixRoundError) throw error;
    throw new LiveFixRoundError(isConflict(error) ? 'CONFLICT' : 'UNCONFIRMED');
  }
};

export const loadLiveFixRound = async (
  projectKey: string,
  testCaseId: number,
  roundId: number,
  signal: AbortSignal,
): Promise<NativeFixRound> => {
  const response = await fetch<unknown>(
    URLS.liveTestCaseFixRoundById(projectKey, testCaseId, roundId),
    { signal, validateStatus: (status) => (status >= 200 && status < 300) || status === 404 },
    true,
  );
  if (response.status === 404) throw new LiveFixRoundError('MISSING');
  return normalizeLiveFixRound(response.data, testCaseId, roundId);
};
