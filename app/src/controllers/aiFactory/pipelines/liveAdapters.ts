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

import { IterationSummaryRS, LivePipelineStatus, PipelineRS } from 'types/aiFactory';

export type ReducedPipelineStatus = LivePipelineStatus | 'UNKNOWN';

export interface LivePipelineRaw {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  autoReadyEnabled?: unknown;
  autoReadyThreshold?: unknown;
  iterationsCount?: unknown;
  latestIteration?: unknown;
  createdAt?: unknown;
}

export interface LivePipelineStageRaw {
  id?: unknown;
  stageKey?: unknown;
  name?: unknown;
  shortName?: unknown;
  sequence?: unknown;
  parentStageId?: unknown;
  status?: unknown;
  metrics?: unknown;
}

export interface LivePipelineIterationRaw {
  id?: unknown;
  pipelineId?: unknown;
  pipelineName?: unknown;
  iterationNumber?: unknown;
  status?: unknown;
  metrics?: unknown;
  attributes?: unknown;
  trigger?: unknown;
  rerun?: unknown;
  rerunOfIterationId?: unknown;
  stagesCount?: unknown;
  stages?: unknown;
  startedAt?: unknown;
  finishedAt?: unknown;
  durationMillis?: unknown;
  createdBy?: unknown;
  createdAt?: unknown;
}

export interface ReducedPipeline {
  kind: 'reduced';
  id: number;
  name: string;
  description?: string;
  iterationsCount?: number;
  autoReady?: {
    enabled: boolean;
    threshold?: number;
  };
}

export interface ReducedPipelineStage {
  key: string;
  label: string;
  sequence?: number;
  status: ReducedPipelineStatus;
}

export interface ReducedPipelineIteration {
  kind: 'reduced';
  id: number;
  pipelineId: number;
  number: number;
  status: ReducedPipelineStatus;
  trigger?: string;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  attributes: Array<{ key: string; value: string }>;
  stages: ReducedPipelineStage[];
}

export const isReducedPipeline = (
  pipeline: PipelineRS | ReducedPipeline,
): pipeline is ReducedPipeline => 'kind' in pipeline && pipeline.kind === 'reduced';

export const isReducedPipelineIteration = (
  iteration: IterationSummaryRS | ReducedPipelineIteration,
): iteration is ReducedPipelineIteration => 'kind' in iteration && iteration.kind === 'reduced';

export const isRichPipeline = (pipeline: PipelineRS | ReducedPipeline): pipeline is PipelineRS =>
  !isReducedPipeline(pipeline);

export const isRichPipelineIteration = (
  iteration: IterationSummaryRS | ReducedPipelineIteration,
): iteration is IterationSummaryRS => !isReducedPipelineIteration(iteration);

const LIVE_STATUSES = new Set<string>(['PENDING', 'PASSED', 'FAILED', 'NEEDS_HUMAN']);
const UNSAFE_ATTRIBUTE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_PIPELINES = 100;
const MAX_ITERATIONS = 1000;
const MAX_STAGES = 100;
const MAX_ATTRIBUTES = 100;
const MAX_NAME_LENGTH = 255;
const MAX_KEY_LENGTH = 128;
const MAX_TEXT_LENGTH = 2000;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asPositiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;

const asNonNegativeInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;

const asTrimmedString = (value: unknown, maxLength = MAX_TEXT_LENGTH): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
};

const asTimestamp = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || value.length > MAX_NAME_LENGTH) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const asStatus = (value: unknown): ReducedPipelineStatus =>
  typeof value === 'string' && LIVE_STATUSES.has(value) ? (value as LivePipelineStatus) : 'UNKNOWN';

const adaptAttributes = (value: unknown): Array<{ key: string; value: string }> | null => {
  if (value === undefined) {
    return [];
  }
  const attributes = asRecord(value);
  if (!attributes) {
    return null;
  }
  const entries = Object.entries(attributes);
  if (
    entries.length > MAX_ATTRIBUTES ||
    entries.some(
      ([key, attributeValue]) =>
        UNSAFE_ATTRIBUTE_KEYS.has(key) ||
        !asTrimmedString(key, MAX_KEY_LENGTH) ||
        !asTrimmedString(attributeValue, MAX_TEXT_LENGTH),
    )
  ) {
    return null;
  }
  entries.sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));
  return entries.map(([key, attributeValue]) => ({
    key: key.trim(),
    value: (attributeValue as string).trim(),
  }));
};

const adaptStage = (value: unknown): ReducedPipelineStage | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const key = asTrimmedString(raw.stageKey, MAX_KEY_LENGTH);
  const label =
    asTrimmedString(raw.shortName, MAX_NAME_LENGTH) ??
    asTrimmedString(raw.name, MAX_NAME_LENGTH) ??
    key;
  const sequence = asNonNegativeInteger(raw.sequence);
  if (!key || !label || (raw.sequence !== undefined && sequence === undefined)) {
    return null;
  }

  return {
    key,
    label,
    sequence,
    status: asStatus(raw.status),
  };
};

const adaptStages = (value: unknown): ReducedPipelineStage[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_STAGES) {
    return null;
  }
  const uniqueStages = new Map<string, ReducedPipelineStage>();
  for (const rawStage of value) {
    const stage = adaptStage(rawStage);
    if (!stage || uniqueStages.has(stage.key)) {
      return null;
    }
    uniqueStages.set(stage.key, stage);
  }

  return Array.from(uniqueStages.values()).sort((first, second) => {
    const sequenceDifference =
      (first.sequence ?? Number.MAX_SAFE_INTEGER) - (second.sequence ?? Number.MAX_SAFE_INTEGER);
    return sequenceDifference || first.key.localeCompare(second.key);
  });
};

const adaptPipeline = (value: unknown): ReducedPipeline | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const id = asPositiveInteger(raw.id);
  const name = asTrimmedString(raw.name, MAX_NAME_LENGTH);
  const description = asTrimmedString(raw.description, MAX_TEXT_LENGTH);
  if (!id || !name) {
    return null;
  }
  const isAutoReadyConfigured = typeof raw.autoReadyEnabled === 'boolean';
  const iterationsCount = asNonNegativeInteger(raw.iterationsCount);
  const autoReadyThreshold = asNonNegativeInteger(raw.autoReadyThreshold);
  if (
    (raw.iterationsCount !== undefined && iterationsCount === undefined) ||
    (raw.description !== undefined && description === undefined) ||
    (raw.autoReadyEnabled !== undefined && !isAutoReadyConfigured) ||
    (raw.autoReadyThreshold !== undefined &&
      (!isAutoReadyConfigured || autoReadyThreshold === undefined || autoReadyThreshold > 100))
  ) {
    return null;
  }

  return {
    kind: 'reduced',
    id,
    name,
    description,
    iterationsCount,
    autoReady: isAutoReadyConfigured
      ? {
          enabled: raw.autoReadyEnabled as boolean,
          threshold: autoReadyThreshold,
        }
      : undefined,
  };
};

const adaptIteration = (
  value: unknown,
  expectedPipelineId: number,
): ReducedPipelineIteration | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const id = asPositiveInteger(raw.id);
  const pipelineId = asPositiveInteger(raw.pipelineId);
  const number = asPositiveInteger(raw.iterationNumber);
  const durationMs = asNonNegativeInteger(raw.durationMillis);
  const trigger = asTrimmedString(raw.trigger, MAX_NAME_LENGTH);
  const startedAt = asTimestamp(raw.startedAt);
  const finishedAt = asTimestamp(raw.finishedAt);
  const attributes = adaptAttributes(raw.attributes);
  const stages = adaptStages(raw.stages);
  if (
    !id ||
    pipelineId !== expectedPipelineId ||
    !number ||
    (raw.durationMillis !== undefined && durationMs === undefined) ||
    (raw.trigger !== undefined && trigger === undefined) ||
    (raw.startedAt !== undefined && startedAt === undefined) ||
    (raw.finishedAt !== undefined && finishedAt === undefined) ||
    !attributes ||
    !stages
  ) {
    return null;
  }

  return {
    kind: 'reduced',
    id,
    pipelineId,
    number,
    status: asStatus(raw.status),
    trigger,
    startedAt,
    finishedAt,
    durationMs,
    attributes,
    stages,
  };
};

export const adaptLivePipelines = (value: unknown): ReducedPipeline[] => {
  if (!Array.isArray(value) || value.length > MAX_PIPELINES) {
    throw new Error('Invalid pipeline catalog response');
  }
  const pipelines = value.map(adaptPipeline);
  if (pipelines.some((pipeline) => !pipeline)) {
    throw new Error('Invalid pipeline catalog entity');
  }
  const normalized = pipelines;
  if (new Set(normalized.map((pipeline) => pipeline.id)).size !== normalized.length) {
    throw new Error('Duplicate pipeline id');
  }
  return normalized;
};

export const adaptLivePipelineIterations = (
  value: unknown,
  pipelineId: number,
): ReducedPipelineIteration[] => {
  if (!Array.isArray(value) || value.length > MAX_ITERATIONS) {
    throw new Error('Invalid pipeline iteration list response');
  }
  const iterations = value.map((iteration) => adaptIteration(iteration, pipelineId));
  if (iterations.some((iteration) => !iteration)) {
    throw new Error('Invalid pipeline iteration entity');
  }
  const normalized = iterations;
  if (new Set(normalized.map((iteration) => iteration.id)).size !== normalized.length) {
    throw new Error('Duplicate pipeline iteration id');
  }
  return normalized;
};
