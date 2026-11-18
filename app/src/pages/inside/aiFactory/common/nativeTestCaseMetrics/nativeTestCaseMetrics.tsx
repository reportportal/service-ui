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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import type { NativeTestCaseSummary } from 'common/utils/nativeTestCase';
import { NativeMetricsIterationLink } from 'pages/inside/aiFactory/common/nativeTestCaseMetrics/nativeMetricsIterationLink';
import { messages } from 'pages/inside/aiFactory/common/nativeTestCaseMetrics/messages';
import styles from 'pages/inside/aiFactory/common/nativeTestCaseMetrics/nativeTestCaseMetrics.scss';

interface NativeTestCaseMetricsProps {
  summary: NativeTestCaseSummary;
  testCaseId: number;
}

const cx = createClassnames(styles);

export const NativeTestCaseMetrics = ({ summary, testCaseId }: NativeTestCaseMetricsProps) => {
  const { formatMessage, formatDate, formatNumber } = useIntl();
  const metrics = summary.isAi ? summary.metrics : undefined;
  if (!metrics) return null;
  const evaluatedAt = metrics.evaluatedAt === undefined ? undefined : new Date(metrics.evaluatedAt);
  return (
    <section
      className={cx('native-metrics')}
      aria-label={formatMessage(messages.title)}
      data-automation-id="native-test-case-metrics"
    >
      {evaluatedAt && Number.isFinite(evaluatedAt.getTime()) && (
        <span>
          {formatMessage(messages.evaluatedAt, {
            date: formatDate(evaluatedAt, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          })}
        </span>
      )}
      {metrics.skill && <span>{formatMessage(messages.skill, { skill: metrics.skill })}</span>}
      {metrics.tokensIn !== undefined && (
        <span>{formatMessage(messages.tokensIn, { count: formatNumber(metrics.tokensIn) })}</span>
      )}
      {metrics.tokensOut !== undefined && (
        <span>{formatMessage(messages.tokensOut, { count: formatNumber(metrics.tokensOut) })}</span>
      )}
      {metrics.criteria?.map(
        (criterion) =>
          criterion.score !== undefined && (
            <span
              key={
                criterion.criterionId ??
                `${criterion.name}-${criterion.score}-${criterion.maxPoints}`
              }
            >
              {formatMessage(
                criterion.maxPoints === undefined
                  ? messages.criterion
                  : messages.criterionWithMaximum,
                {
                  name: criterion.name,
                  score: formatNumber(criterion.score),
                  maximum:
                    criterion.maxPoints === undefined
                      ? undefined
                      : formatNumber(criterion.maxPoints),
                },
              )}
            </span>
          ),
      )}
      {metrics.pipelineIterationId !== undefined && (
        <NativeMetricsIterationLink
          testCaseId={testCaseId}
          iterationId={metrics.pipelineIterationId}
          iterationNumber={metrics.pipelineIterationNumber}
        />
      )}
    </section>
  );
};
