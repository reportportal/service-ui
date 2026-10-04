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
import { SystemMessage } from '@reportportal/ui-kit';

import { createClassnames, formatCost, formatDuration } from 'common/utils';
import {
  DeltaCell,
  IterationStatusBadge,
  STAGE_LABEL_MESSAGE,
  StageStatusLabel,
} from 'pages/inside/aiFactory/common';
import {
  AiStageKey,
  ComparisonIteration,
  ComparisonStageEntry,
  PipelineComparison,
} from 'types/aiFactory';

import { buildComparisonMetrics, ComparisonMetric } from './compareIterationsUtils';
import { messages } from './messages';
import styles from './compareIterationsPage.scss';

const cx = createClassnames(styles);

const hasKnownStageLabel = (stageKey: string): stageKey is AiStageKey =>
  Object.prototype.hasOwnProperty.call(STAGE_LABEL_MESSAGE, stageKey) === true;

interface StageEntryProps {
  iterationNumber: number;
  entry?: ComparisonStageEntry;
  isRich: boolean;
}

const StageEntry = ({ iterationNumber, entry, isRich }: StageEntryProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('stage__iteration')}>
      <span className={cx('stage__iteration-name')}>
        {formatMessage(messages.iterationOption, { number: iterationNumber })}
      </span>
      {entry?.status && entry.status !== 'UNKNOWN' ? (
        <StageStatusLabel status={entry.status} />
      ) : (
        formatMessage(messages.unavailable)
      )}
      {isRich && entry?.cost !== undefined && (
        <span className={cx('stage__meta')}>
          {formatMessage(messages.stageCost, { cost: formatCost(entry.cost) })}
        </span>
      )}
      {isRich && entry?.durationMs !== undefined && (
        <span className={cx('stage__meta')}>
          {formatMessage(messages.stageDuration, { duration: formatDuration(entry.durationMs) })}
        </span>
      )}
    </div>
  );
};

const IterationIdentity = ({ iteration }: { iteration: ComparisonIteration }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('identity')}>
      <span>{formatMessage(messages.iterationOption, { number: iteration.number })}</span>
      {iteration.status !== 'UNKNOWN' && <IterationStatusBadge status={iteration.status} />}
    </div>
  );
};

const formatNeutralDelta = (metric: ComparisonMetric) => {
  const delta = metric.candidate - metric.baseline;
  let sign = '';
  if (delta > 0) {
    sign = '+';
  } else if (delta < 0) {
    sign = '−';
  }
  return `${sign}${metric.format(Math.abs(delta))}`;
};

const MetricDelta = ({ metric }: { metric: ComparisonMetric }) => {
  if (metric.direction === 'neutral') {
    return <span className={cx('neutral-delta')}>{formatNeutralDelta(metric)}</span>;
  }

  return (
    <DeltaCell
      value={metric.candidate - metric.baseline}
      higherIsBetter={metric.direction === 'higher'}
      format={metric.format}
    />
  );
};

export interface ComparisonResultProps {
  comparison: PipelineComparison;
}

export const ComparisonResult = ({ comparison }: ComparisonResultProps) => {
  const intl = useIntl();
  const isRich = comparison.mode === 'mock-rich';
  const metrics = isRich
    ? buildComparisonMetrics(comparison.baseline, comparison.candidate, intl)
    : [];
  const stageLabel = (stageKey: string) => {
    return hasKnownStageLabel(stageKey)
      ? intl.formatMessage(STAGE_LABEL_MESSAGE[stageKey])
      : intl.formatMessage(messages.unknownStage, { stage: stageKey });
  };

  return (
    <div className={cx('result')}>
      {comparison.hasDifferentRequirements && (
        <SystemMessage mode="warning">
          {intl.formatMessage(messages.differentRequirements)}
        </SystemMessage>
      )}
      {!isRich && (
        <SystemMessage mode="info">
          {intl.formatMessage(messages.statusOnlyExplanation)}
        </SystemMessage>
      )}
      <div className={cx('identities')}>
        <IterationIdentity iteration={comparison.baseline} />
        <IterationIdentity iteration={comparison.candidate} />
      </div>
      {comparison.stages.length === 0 && metrics.length === 0 && (
        <div className={cx('state')}>{intl.formatMessage(messages.noComparisonData)}</div>
      )}
      {comparison.stages.length > 0 && (
        <section className={cx('section')} aria-labelledby="comparison-stages-title">
          <h2 id="comparison-stages-title" className={cx('section__title')}>
            {intl.formatMessage(messages.stagesTitle)}
          </h2>
          <div className={cx('stage-list')}>
            {comparison.stages.map((stage) => (
              <article key={stage.key} className={cx('stage')}>
                <div className={cx('stage__title')}>{stageLabel(stage.key)}</div>
                <StageEntry
                  iterationNumber={comparison.baseline.number}
                  entry={stage.baseline}
                  isRich={isRich}
                />
                <StageEntry
                  iterationNumber={comparison.candidate.number}
                  entry={stage.candidate}
                  isRich={isRich}
                />
              </article>
            ))}
          </div>
        </section>
      )}
      {metrics.length > 0 && (
        <section className={cx('section')} aria-labelledby="comparison-metrics-title">
          <h2 id="comparison-metrics-title" className={cx('section__title')}>
            {intl.formatMessage(messages.metricsTitle)}
          </h2>
          <div className={cx('table-wrapper')}>
            <table className={cx('table')}>
              <thead>
                <tr>
                  <th scope="col">{intl.formatMessage(messages.metricColumn)}</th>
                  <th scope="col">
                    {intl.formatMessage(messages.baselineLabel)} ·{' '}
                    {intl.formatMessage(messages.iterationOption, {
                      number: comparison.baseline.number,
                    })}
                  </th>
                  <th scope="col">
                    {intl.formatMessage(messages.candidateLabel)} ·{' '}
                    {intl.formatMessage(messages.iterationOption, {
                      number: comparison.candidate.number,
                    })}
                  </th>
                  <th scope="col">{intl.formatMessage(messages.deltaColumn)}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.key}>
                    <td>{metric.label}</td>
                    <td>{metric.format(metric.baseline)}</td>
                    <td>{metric.format(metric.candidate)}</td>
                    <td>
                      <MetricDelta metric={metric} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
