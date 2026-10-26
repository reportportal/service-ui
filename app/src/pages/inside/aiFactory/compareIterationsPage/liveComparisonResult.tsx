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
import type { LiveComparisonStage, LivePipelineComparison } from 'controllers/aiFactory/pipelines';

import { messages } from './messages';
import styles from './compareIterationsPage.scss';

const cx = createClassnames(styles);

const statusTone = (category?: string, label?: string) => {
  const status = (category || label || '').toUpperCase().replace(/ /g, '_');
  if (status === 'PASSED' || status === 'DONE' || status === 'COMPLETED') return 'success';
  if (status === 'FAILED' || status === 'ERROR') return 'error';
  if (status === 'RUNNING' || status === 'IN_PROGRESS') return 'active';
  if (status === 'NEEDS_HUMAN' || status === 'IN_REVIEW' || status === 'WAITING') return 'warning';
  return 'neutral';
};

const humanizeEnum = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());

const formatMetricValue = (
  value: string | undefined,
  valueType: string | undefined,
  fallback: string,
) => {
  if (value === undefined) return fallback;
  const amount = Number(value);
  if (valueType !== 'MONEY' || value.trim() === '' || !Number.isFinite(amount)) return value;
  let sign = '';
  if (value.trim().startsWith('+')) {
    sign = '+';
  } else if (amount < 0) {
    sign = '−';
  }
  return `${sign}${formatCost(Math.abs(amount))}`;
};

interface StageComparisonEntryProps {
  number: number;
  status?: string;
  category?: string;
  durationMs?: number;
  cost?: number;
}

const StageComparisonEntry = ({
  number,
  status,
  category,
  durationMs,
  cost,
}: StageComparisonEntryProps) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('live-stage-entry')}>
      <span className={cx('live-stage-entry__iteration')}>
        {formatMessage(messages.iterationOption, { number })}
      </span>
      <span className={cx('live-status', `live-status--${statusTone(category, status)}`)}>
        {status || formatMessage(messages.unavailable)}
      </span>
      {(durationMs !== undefined || cost !== undefined) && (
        <span className={cx('live-stage-entry__meta')}>
          {durationMs !== undefined ? formatDuration(durationMs) : ''}
          {durationMs !== undefined && cost !== undefined ? ' · ' : ''}
          {cost !== undefined ? formatCost(cost) : ''}
        </span>
      )}
    </div>
  );
};

const stageEntry = (stage: LiveComparisonStage, side: 'baseline' | 'candidate') => ({
  status: stage[side],
  category: stage[`${side}Category`],
  durationMs: stage[`${side}DurationMs`],
  cost: stage[`${side}Cost`],
});

export interface LiveComparisonResultProps {
  comparison: LivePipelineComparison;
}

const renderComparisonScopeNotice = (
  comparison: LivePipelineComparison,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => {
  if (comparison.isFixComparison)
    return <SystemMessage mode="info">{formatMessage(messages.fixSubsetScope)}</SystemMessage>;
  return (
    <>
      {comparison.sameScope === false && (
        <SystemMessage mode="info">
          {comparison.note || formatMessage(messages.differentScope)}
        </SystemMessage>
      )}
      {comparison.sameScope === undefined && (
        <SystemMessage mode="info">{formatMessage(messages.scopeUnavailable)}</SystemMessage>
      )}
      {comparison.sameScope !== false && comparison.note && (
        <SystemMessage mode="info">{comparison.note}</SystemMessage>
      )}
    </>
  );
};

export const LiveComparisonResult = ({ comparison }: LiveComparisonResultProps) => {
  const { formatMessage } = useIntl();
  const { baseline, candidate } = comparison;
  const hasMetricTypes = comparison.metrics.some((metric) => metric.valueType);
  const hasMetricVerdicts =
    !comparison.isFixComparison && comparison.metrics.some((metric) => metric.verdict);

  return (
    <div className={cx('result')} data-automation-id="livePipelineComparison">
      {renderComparisonScopeNotice(comparison, formatMessage)}
      <div className={cx('identities', 'live-identities')}>
        <div className={cx('identity', 'live-identity')}>
          <span className={cx('live-identity__label')}>
            {formatMessage(messages.baselineLabel)}
          </span>
          <span className={cx('live-identity__number')}>
            {formatMessage(messages.iterationOption, { number: baseline.number })}
          </span>
          <span className={cx('live-status', `live-status--${statusTone(baseline.status)}`)}>
            {baseline.statusText || baseline.status}
          </span>
        </div>
        <div className={cx('identity', 'live-identity')}>
          <span className={cx('live-identity__label')}>
            {formatMessage(messages.candidateLabel)}
          </span>
          <span className={cx('live-identity__number')}>
            {formatMessage(messages.iterationOption, { number: candidate.number })}
          </span>
          <span className={cx('live-status', `live-status--${statusTone(candidate.status)}`)}>
            {candidate.statusText || candidate.status}
          </span>
        </div>
      </div>
      {!comparison.stages.length && !comparison.metrics.length && !comparison.sections.length && (
        <div className={cx('state')}>{formatMessage(messages.noComparisonData)}</div>
      )}
      {comparison.stages.length > 0 && (
        <section className={cx('section')}>
          <h2 className={cx('section__title')}>{formatMessage(messages.stagesTitle)}</h2>
          <div className={cx('stage-list', 'live-stage-list')}>
            {comparison.stages.map((stage) => (
              <article key={stage.key} className={cx('stage', 'live-stage')}>
                <div className={cx('stage__title')}>{stage.name}</div>
                <StageComparisonEntry number={baseline.number} {...stageEntry(stage, 'baseline')} />
                <StageComparisonEntry
                  number={candidate.number}
                  {...stageEntry(stage, 'candidate')}
                />
              </article>
            ))}
          </div>
        </section>
      )}
      {comparison.metrics.length > 0 && (
        <section className={cx('section')}>
          <h2 className={cx('section__title')}>{formatMessage(messages.metricsTitle)}</h2>
          <div className={cx('table-wrapper')}>
            <table className={cx('table')}>
              <thead>
                <tr>
                  <th scope="col">{formatMessage(messages.metricColumn)}</th>
                  <th scope="col">
                    {formatMessage(messages.baselineLabel)} ·{' '}
                    {formatMessage(messages.iterationOption, { number: baseline.number })}
                  </th>
                  <th scope="col">
                    {formatMessage(messages.candidateLabel)} ·{' '}
                    {formatMessage(messages.iterationOption, { number: candidate.number })}
                  </th>
                  {!comparison.isFixComparison && (
                    <th scope="col">{formatMessage(messages.deltaColumn)}</th>
                  )}
                  {hasMetricVerdicts && (
                    <th scope="col">{formatMessage(messages.verdictColumn)}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparison.metrics.map((metric) => (
                  <tr key={metric.key}>
                    <td>
                      <span className={cx('live-metric__label')}>{metric.label}</span>
                      {hasMetricTypes && metric.valueType && (
                        <span className={cx('live-metric__type')}>
                          {humanizeEnum(metric.valueType)}
                        </span>
                      )}
                    </td>
                    <td>
                      {formatMetricValue(
                        metric.baseline,
                        metric.valueType,
                        formatMessage(messages.unavailable),
                      )}
                    </td>
                    <td>
                      {formatMetricValue(
                        metric.candidate,
                        metric.valueType,
                        formatMessage(messages.unavailable),
                      )}
                    </td>
                    {!comparison.isFixComparison && (
                      <td>
                        {formatMetricValue(
                          metric.delta,
                          metric.valueType,
                          formatMessage(messages.unavailable),
                        )}
                      </td>
                    )}
                    {hasMetricVerdicts && (
                      <td>
                        {metric.verdict
                          ? humanizeEnum(metric.verdict)
                          : formatMessage(messages.unavailable)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {(comparison.isFixComparison ? [] : comparison.sections).map((section) => (
        <section className={cx('section')} key={section.key}>
          <h2 className={cx('section__title')}>
            {section.stageName ? `${section.stageName} · ${section.title}` : section.title}
          </h2>
          <div className={cx('table-wrapper')}>
            <table className={cx('table')}>
              <thead>
                <tr>
                  <th scope="col">{formatMessage(messages.rowColumn)}</th>
                  {section.columns.map((column) => (
                    <th scope="col" key={column.key}>
                      {column.label} · {formatMessage(messages.baselineLabel)}
                    </th>
                  ))}
                  {section.columns.map((column) => (
                    <th scope="col" key={`${column.key}:candidate`}>
                      {column.label} · {formatMessage(messages.candidateLabel)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.key}</td>
                    {section.columns.map((column) => (
                      <td key={column.key}>
                        {row.baseline[column.key] ?? formatMessage(messages.unavailable)}
                      </td>
                    ))}
                    {section.columns.map((column) => (
                      <td key={`${column.key}:candidate`}>
                        {row.candidate[column.key] ?? formatMessage(messages.unavailable)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {comparison.rawResponse && (
        <details className={cx('live-api-response')} data-automation-id="fullComparisonApiResponse">
          <summary>{formatMessage(messages.fullApiResponse)}</summary>
          <pre>{JSON.stringify(comparison.rawResponse, null, 2)}</pre>
        </details>
      )}
    </div>
  );
};
