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
import {
  adaptLivePipelineIterationDetail,
  type ReducedPipelineIterationDetail,
} from 'controllers/aiFactory/pipelines/liveAdapters';

export interface TraceResource {
  projectKey: string;
  iterationId: number;
  stageKey: string;
}

export type StageTraceStatus = 'REPORTED' | 'NOT_REPORTED';

export interface StageTraceAttempt {
  attempt: number;
  stageStatus?: string;
  stageStatusCategory?: string;
  traceStatus: StageTraceStatus;
  eventCount: number;
  reportedAt?: string;
  current: boolean;
}

export type StageTraceEventType =
  | 'PROMPT'
  | 'AGENT'
  | 'TOOL_CALL'
  | 'SELF_REVIEW'
  | 'SELF_FIX'
  | 'GRADERS'
  | 'FINAL'
  | 'START'
  | 'STEP'
  | 'END'
  | (string & {});

export interface StageTraceEvent {
  seq: number;
  type: StageTraceEventType;
  unitKey?: string;
  title?: string;
  offsetMs?: number;
  durationMs?: number;
  target?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export interface StageTrace {
  iterationId: number;
  stageKey: string;
  attempt: number;
  status: StageTraceStatus;
  reason?: string;
  reportedAt?: string;
  events: StageTraceEvent[];
}

export type StageTraceErrorReason =
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_RESPONSE'
  | 'REQUEST_FAILED';

export class StageTraceError extends Error {
  readonly reason: StageTraceErrorReason;

  constructor(reason: StageTraceErrorReason) {
    super(reason);
    this.name = 'StageTraceError';
    this.reason = reason;
  }
}

const invalidResponse = (): never => {
  throw new StageTraceError('INVALID_RESPONSE');
};

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalidResponse();
  }
  return value as Record<string, unknown>;
};

const asInteger = (value: unknown, minimum = 0): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) {
    return invalidResponse();
  }
  return value;
};

const asString = (value: unknown, maximum: number, allowEmpty = true): string => {
  if (typeof value !== 'string' || value.length > maximum || (!allowEmpty && !value.trim())) {
    return invalidResponse();
  }
  return value;
};

const asOptionalString = (value: unknown, maximum: number): string | undefined =>
  value == null ? undefined : asString(value, maximum);

const asOptionalInteger = (value: unknown): number | undefined =>
  value == null ? undefined : asInteger(value);

const asStatus = (value: unknown): StageTraceStatus => {
  if (value !== 'REPORTED' && value !== 'NOT_REPORTED') {
    return invalidResponse();
  }
  return value;
};

const asReportedAt = (value: unknown): string | undefined => {
  const timestamp = asOptionalString(value, 255);
  if (timestamp !== undefined && !Number.isFinite(Date.parse(timestamp))) {
    return invalidResponse();
  }
  return timestamp;
};

export const normalizeStageTraceEvent = (value: unknown): StageTraceEvent => {
  const raw = asRecord(value);
  if (raw.unitKey != null && typeof raw.unitKey !== 'string') return invalidResponse();
  return {
    seq: asInteger(raw.seq),
    type: asString(raw.type, 255, false),
    ...(raw.unitKey == null ? {} : { unitKey: raw.unitKey as string }),
    title: asOptionalString(raw.title, 512),
    offsetMs: asOptionalInteger(raw.offsetMs),
    durationMs: asOptionalInteger(raw.durationMs),
    target: asOptionalString(raw.target, 1024),
    text: asOptionalString(raw.text, 10_000_000),
    ...(raw.data == null ? {} : { data: asRecord(raw.data) }),
  };
};

const normalizeTraceAttempt = (value: unknown): StageTraceAttempt => {
  const raw = asRecord(value);
  if (typeof raw.current !== 'boolean') {
    return invalidResponse();
  }
  return {
    attempt: asInteger(raw.attempt, 1),
    stageStatus: asOptionalString(raw.stageStatus, 255),
    stageStatusCategory: asOptionalString(raw.stageStatusCategory, 255),
    traceStatus: asStatus(raw.traceStatus),
    eventCount: asInteger(raw.eventCount),
    reportedAt: asReportedAt(raw.reportedAt),
    current: raw.current,
  };
};

export const normalizeStageTraceAttempts = (value: unknown): StageTraceAttempt[] => {
  if (!Array.isArray(value)) {
    return invalidResponse();
  }
  const attempts = value
    .map(normalizeTraceAttempt)
    .sort((first, second) => first.attempt - second.attempt);
  const numbers = attempts.map(({ attempt }) => attempt);
  if (
    new Set(numbers).size !== numbers.length ||
    attempts.filter(({ current }) => current).length !== 1
  ) {
    return invalidResponse();
  }
  return attempts;
};

const normalizeTraceEvents = (value: unknown): StageTraceEvent[] => {
  if (!Array.isArray(value)) {
    return invalidResponse();
  }
  const events = value.map(normalizeStageTraceEvent);
  if (new Set(events.map(({ seq }) => seq)).size !== events.length) {
    return invalidResponse();
  }
  return events.sort((first, second) => first.seq - second.seq);
};

export const normalizeStageTrace = (
  value: unknown,
  resource: TraceResource & { attempt?: number },
): StageTrace => {
  const raw = asRecord(value);
  if (
    raw.iterationId !== resource.iterationId ||
    raw.stageKey !== resource.stageKey ||
    (resource.attempt !== undefined && raw.attempt !== resource.attempt)
  ) {
    return invalidResponse();
  }
  return {
    iterationId: asInteger(raw.iterationId, 1),
    stageKey: asString(raw.stageKey, 128, false),
    attempt: asInteger(raw.attempt, 1),
    status: asStatus(raw.status),
    reason: asOptionalString(raw.reason, 4000),
    reportedAt: asReportedAt(raw.reportedAt),
    events: normalizeTraceEvents(raw.events),
  };
};

const validateResource = (resource: TraceResource & { attempt?: number }): void => {
  asString(resource.projectKey, 255, false);
  asInteger(resource.iterationId, 1);
  asString(resource.stageKey, 128, false);
  if (resource.attempt !== undefined) {
    asInteger(resource.attempt, 1);
  }
};

const requestTraceResource = async (url: string, signal?: AbortSignal): Promise<unknown> => {
  try {
    const response = await fetch(
      url,
      {
        signal,
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 403 || status === 404,
      },
      true,
    );
    if (response.status === 403) throw new StageTraceError('FORBIDDEN');
    if (response.status === 404) throw new StageTraceError('NOT_FOUND');
    return response.data;
  } catch (error) {
    if (
      error instanceof StageTraceError ||
      (error instanceof Error && ['REQUEST_CANCELED', 'UNAUTHORIZED'].includes(error.message))
    ) {
      throw error;
    }
    throw new StageTraceError('REQUEST_FAILED');
  }
};

export const loadStageTraceAttempts = async (
  resource: TraceResource,
  signal?: AbortSignal,
): Promise<StageTraceAttempt[]> => {
  validateResource(resource);
  const url = URLS.pipelineStageTraceAttempts(
    resource.projectKey,
    resource.iterationId,
    resource.stageKey,
  );
  return normalizeStageTraceAttempts(await requestTraceResource(url, signal));
};

export const loadStageTrace = async (
  resource: TraceResource & { attempt?: number },
  signal?: AbortSignal,
): Promise<StageTrace> => {
  validateResource(resource);
  const url = URLS.pipelineStageTrace(
    resource.projectKey,
    resource.iterationId,
    resource.stageKey,
    resource.attempt,
  );
  return normalizeStageTrace(await requestTraceResource(url, signal), resource);
};

export const loadTraceIteration = async (
  projectKey: string,
  pipelineId: number,
  iterationId: number,
  signal?: AbortSignal,
): Promise<ReducedPipelineIterationDetail> => {
  asString(projectKey, 255, false);
  asInteger(pipelineId, 1);
  asInteger(iterationId, 1);
  const data = await requestTraceResource(
    URLS.pipelineIterationById(projectKey, iterationId),
    signal,
  );
  try {
    return adaptLivePipelineIterationDetail(data, pipelineId, iterationId);
  } catch {
    return invalidResponse();
  }
};
