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

import { adaptLivePipelineIterationDetail } from './liveAdapters';

type RecordValue = Record<string, unknown>;

const record = (value: unknown): RecordValue | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as RecordValue)
    : null;

const string = (value: unknown, maxLength = 2048): string | undefined =>
  typeof value === 'string' && value.length <= maxLength ? value : undefined;

const displayValue = (value: unknown): string | undefined => {
  const cell = record(value);
  const scalar = cell ? cell.value : value;
  if (typeof scalar === 'number' && Number.isFinite(scalar)) return String(scalar);
  if (typeof scalar === 'boolean') return String(scalar);
  return string(scalar);
};

export interface LiveComparisonStage {
  key: string;
  name: string;
  baseline?: string;
  candidate?: string;
  baselineCategory?: string;
  candidateCategory?: string;
  baselineDurationMs?: number;
  candidateDurationMs?: number;
  baselineCost?: number;
  candidateCost?: number;
}

export interface LiveComparisonMetric {
  key: string;
  label: string;
  valueType?: string;
  baseline?: string;
  candidate?: string;
  delta?: string;
  verdict?: string;
}

export interface LiveComparisonSection {
  key: string;
  title: string;
  stageName?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<{
    key: string;
    baseline: Record<string, string>;
    candidate: Record<string, string>;
  }>;
}

export interface LivePipelineComparison {
  mode: 'live';
  projectKey?: string;
  pipelineId: number;
  baseline: { id: number; number: number; status: string; statusText?: string };
  candidate: { id: number; number: number; status: string; statusText?: string };
  sameScope?: boolean;
  note?: string;
  stages: LiveComparisonStage[];
  metrics: LiveComparisonMetric[];
  sections: LiveComparisonSection[];
  rawResponse?: Record<string, unknown>;
}

const stageStatus = (value: unknown): string | undefined => {
  const stage = record(value);
  return stage ? string(stage.status, 256) : undefined;
};

const finiteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const stageCost = (value: unknown): number | undefined => {
  const stage = record(value);
  if (!Array.isArray(stage?.attributes)) return undefined;
  const cost = stage.attributes.find((item) => record(item)?.key === 'cost');
  const amount = record(cost)?.value;
  return typeof amount === 'string' && amount.trim() !== ''
    ? finiteNumber(Number(amount))
    : finiteNumber(amount);
};

const adaptStages = (value: unknown): LiveComparisonStage[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item, index) => {
    const stage = record(item);
    const name = string(stage?.name, 256);
    if (!name) return [];
    const baseline = record(stage?.baseline);
    const candidate = record(stage?.candidate);
    return [
      {
        key: `${index}:${name}`,
        name,
        baseline: stageStatus(baseline),
        candidate: stageStatus(candidate),
        baselineCategory: string(baseline?.statusCategory, 64),
        candidateCategory: string(candidate?.statusCategory, 64),
        baselineDurationMs: finiteNumber(baseline?.durationMillis),
        candidateDurationMs: finiteNumber(candidate?.durationMillis),
        baselineCost: stageCost(baseline),
        candidateCost: stageCost(candidate),
      },
    ];
  });
};

const adaptMetrics = (value: unknown): LiveComparisonMetric[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item, index) => {
    const metric = record(item);
    const key = string(metric?.key, 128);
    if (!key) return [];
    return [
      {
        key: `${index}:${key}`,
        label: string(metric?.label, 256) || key,
        valueType: string(metric?.valueType, 64),
        baseline: displayValue(metric?.baseline),
        candidate: displayValue(metric?.candidate),
        delta: displayValue(metric?.delta),
        verdict: string(metric?.verdict, 32),
      },
    ];
  });
};

const adaptRowCells = (value: unknown, keys: string[]): Record<string, string> => {
  const row = record(value);
  const cells = record(row?.cells);
  return Object.fromEntries(
    keys.flatMap((key) => {
      const cell = displayValue(cells?.[key]);
      return cell === undefined ? [] : [[key, cell]];
    }),
  );
};

const adaptSections = (value: unknown): LiveComparisonSection[] => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item, sectionIndex) => {
    const section = record(item);
    const sectionKey = string(section?.sectionKey, 128);
    if (!sectionKey) return [];
    const columns = (Array.isArray(section?.columns) ? section.columns : [])
      .slice(0, 30)
      .flatMap((column) => {
        const entry = record(column);
        const key = string(entry?.key, 128);
        return key ? [{ key, label: string(entry?.label, 256) || key }] : [];
      });
    const keys = columns.map(({ key }) => key);
    const rows = (Array.isArray(section?.rows) ? section.rows : [])
      .slice(0, 200)
      .flatMap((row, rowIndex) => {
        const entry = record(row);
        if (!entry) return [];
        return [
          {
            key: string(entry.key, 256) || String(rowIndex),
            baseline: adaptRowCells(entry.baseline, keys),
            candidate: adaptRowCells(entry.candidate, keys),
          },
        ];
      });
    return [
      {
        key: `${sectionIndex}:${sectionKey}`,
        title: string(section?.title, 256) || sectionKey,
        stageName: string(section?.stageName, 256),
        columns,
        rows,
      },
    ];
  });
};

export const adaptLivePipelineComparison = (
  value: unknown,
  pipelineId: number,
  candidateId: number,
  baselineId: number,
): LivePipelineComparison => {
  const raw = record(value);
  if (!raw || candidateId === baselineId) {
    throw new Error('Invalid pipeline comparison');
  }
  const baseline = adaptLivePipelineIterationDetail(raw.baseline, pipelineId, baselineId);
  const candidate = adaptLivePipelineIterationDetail(raw.candidate, pipelineId, candidateId);
  return {
    mode: 'live',
    pipelineId,
    baseline: {
      id: baseline.id,
      number: baseline.number,
      status: baseline.status,
      statusText: baseline.statusText,
    },
    candidate: {
      id: candidate.id,
      number: candidate.number,
      status: candidate.status,
      statusText: candidate.statusText,
    },
    ...(typeof raw.sameScope === 'boolean' ? { sameScope: raw.sameScope } : {}),
    ...(string(raw.note, 2048) ? { note: string(raw.note, 2048) } : {}),
    stages: adaptStages(raw.stages),
    metrics: adaptMetrics(raw.metrics),
    sections: raw.sameScope === true ? adaptSections(raw.sections) : [],
    rawResponse: raw,
  };
};
