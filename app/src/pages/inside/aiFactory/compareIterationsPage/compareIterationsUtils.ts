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

import { IntlShape } from 'react-intl';

import { formatCost, formatDuration } from 'common/utils';
import { CRITERION_MESSAGE } from 'pages/inside/aiFactory/evaluation/criterionMessages';
import { ComparisonIteration, CriterionKey, IterationSummaryRS } from 'types/aiFactory';

import { messages } from './messages';

export type MetricDirection = 'higher' | 'lower' | 'neutral';

export interface ComparisonMetric {
  key: string;
  label: string;
  baseline: number;
  candidate: number;
  direction: MetricDirection;
  format: (value: number) => string;
}

export const parseQueryId = (value: unknown): number | null => {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getLatestPair = (iterations: IterationSummaryRS[]) => {
  const [candidate, baseline] = [...iterations].sort((left, right) => right.number - left.number);
  return baseline && candidate ? { baselineId: baseline.id, candidateId: candidate.id } : null;
};

const addMetric = (
  rows: ComparisonMetric[],
  metric: Omit<ComparisonMetric, 'baseline' | 'candidate'>,
  baseline: number | undefined,
  candidate: number | undefined,
) => {
  if (baseline !== undefined && candidate !== undefined) {
    rows.push({ ...metric, baseline, candidate });
  }
};

export const buildComparisonMetrics = (
  baseline: ComparisonIteration,
  candidate: ComparisonIteration,
  intl: IntlShape,
): ComparisonMetric[] => {
  const rows: ComparisonMetric[] = [];
  const raw = (value: number) => String(value);
  addMetric(
    rows,
    {
      key: 'testCases',
      label: intl.formatMessage(messages.metricTestCases),
      direction: 'neutral',
      format: raw,
    },
    baseline.testCasesCount,
    candidate.testCasesCount,
  );
  addMetric(
    rows,
    {
      key: 'score',
      label: intl.formatMessage(messages.metricSuiteScore),
      direction: 'higher',
      format: raw,
    },
    baseline.suiteScore,
    candidate.suiteScore,
  );
  addMetric(
    rows,
    {
      key: 'ready',
      label: intl.formatMessage(messages.metricReady),
      direction: 'neutral',
      format: raw,
    },
    baseline.readyCount,
    candidate.readyCount,
  );
  addMetric(
    rows,
    {
      key: 'fixRounds',
      label: intl.formatMessage(messages.metricFixRounds),
      direction: 'neutral',
      format: raw,
    },
    baseline.fixRoundsCount,
    candidate.fixRoundsCount,
  );
  addMetric(
    rows,
    {
      key: 'autoReadyPromoted',
      label: intl.formatMessage(messages.metricAutoReadyPromoted),
      direction: 'neutral',
      format: raw,
    },
    baseline.autoReadyPromotedCount,
    candidate.autoReadyPromotedCount,
  );
  Object.values(CriterionKey).forEach((key) =>
    addMetric(
      rows,
      {
        key,
        label: intl.formatMessage(CRITERION_MESSAGE[key]),
        direction: 'higher',
        format: raw,
      },
      baseline.criterionAverages?.[key],
      candidate.criterionAverages?.[key],
    ),
  );
  addMetric(
    rows,
    {
      key: 'cost',
      label: intl.formatMessage(messages.metricCost),
      direction: 'lower',
      format: formatCost,
    },
    baseline.costTotal,
    candidate.costTotal,
  );
  addMetric(
    rows,
    {
      key: 'duration',
      label: intl.formatMessage(messages.metricDuration),
      direction: 'lower',
      format: formatDuration,
    },
    baseline.durationMs,
    candidate.durationMs,
  );
  return rows;
};
