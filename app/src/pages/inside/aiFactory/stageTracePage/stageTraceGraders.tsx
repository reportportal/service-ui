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

import { useState } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import type { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface TraceGraderCriterion {
  name: string;
  score: number;
  max: number;
}
interface TraceGraderData {
  caseId?: string;
  total?: number;
  before?: number;
  after?: number;
  criteria?: TraceGraderCriterion[];
}
interface StageTraceEventDataProps {
  event: StageTraceEvent;
}
interface StageTraceGradersProps {
  data: TraceGraderData;
}
const cx = createClassnames(styles);
const MAX_STRUCTURED_CRITERIA = 100;
const MAX_CRITERION_NAME_LENGTH = 512;
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isCriterion = (value: unknown): value is TraceGraderCriterion => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const criterion = value as Record<string, unknown>;
  return (
    typeof criterion.name === 'string' &&
    criterion.name.length <= MAX_CRITERION_NAME_LENGTH &&
    isFiniteNumber(criterion.score) &&
    isFiniteNumber(criterion.max)
  );
};
export const readTraceGraderData = (raw: Record<string, unknown>): TraceGraderData | undefined => {
  const data: TraceGraderData = {};
  if (typeof raw.caseId === 'string') data.caseId = raw.caseId;
  if (isFiniteNumber(raw.total)) data.total = raw.total;
  if (isFiniteNumber(raw.before)) data.before = raw.before;
  if (isFiniteNumber(raw.after)) data.after = raw.after;
  if (
    Array.isArray(raw.criteria) &&
    raw.criteria.length <= MAX_STRUCTURED_CRITERIA &&
    raw.criteria.every(isCriterion)
  )
    data.criteria = raw.criteria;
  return Object.keys(data).length ? data : undefined;
};
const getCriterionRows = (criteria: TraceGraderCriterion[] = []) => {
  const occurrences = new Map<string, number>();
  return criteria.map((criterion) => {
    const occurrence = occurrences.get(criterion.name) ?? 0;
    occurrences.set(criterion.name, occurrence + 1);
    return { ...criterion, key: `${criterion.name}:${occurrence}` };
  });
};
const StageTraceGraders = ({ data }: StageTraceGradersProps) => {
  const { formatMessage } = useIntl();
  const hasComparison = data.before !== undefined && data.after !== undefined;
  return (
    <section className={cx('graders')} aria-label={formatMessage(messages.graderScores)}>
      <h3>{formatMessage(messages.graderScores)}</h3>
      <dl className={cx('graders__fields')}>
        {data.caseId !== undefined && (
          <>
            <dt>{formatMessage(messages.graderCase)}</dt>
            <dd>{data.caseId}</dd>
          </>
        )}
        {data.total !== undefined && (
          <>
            <dt>{formatMessage(messages.graderTotal)}</dt>
            <dd>{data.total} / 100</dd>
          </>
        )}
        {hasComparison && (
          <>
            <dt>{formatMessage(messages.graderChange)}</dt>
            <dd>
              {data.before} → {data.after} / 100
            </dd>
          </>
        )}
        {!hasComparison && data.before !== undefined && (
          <>
            <dt>{formatMessage(messages.graderBefore)}</dt>
            <dd>{data.before} / 100</dd>
          </>
        )}
        {!hasComparison && data.after !== undefined && (
          <>
            <dt>{formatMessage(messages.graderAfter)}</dt>
            <dd>{data.after} / 100</dd>
          </>
        )}
      </dl>
      {Boolean(data.criteria?.length) && (
        <table className={cx('graders__criteria')}>
          <thead>
            <tr>
              <th scope="col">{formatMessage(messages.graderCriterion)}</th>
              <th scope="col">{formatMessage(messages.graderScore)}</th>
            </tr>
          </thead>
          <tbody>
            {getCriterionRows(data.criteria).map((criterion) => (
              <tr key={criterion.key}>
                <th scope="row">{criterion.name}</th>
                <td>
                  {criterion.score} / {criterion.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
const TraceEventJson = ({ data }: { data: Record<string, unknown> }) => {
  const { formatMessage } = useIntl();
  return (
    <div
      role="textbox"
      aria-readonly="true"
      tabIndex={0}
      className={cx('event__text')}
      aria-label={formatMessage(messages.eventData)}
    >
      {JSON.stringify(data, null, 2)}
    </div>
  );
};
export const StageTraceEventData = ({ event }: StageTraceEventDataProps) => {
  const { formatMessage } = useIntl();
  const [isRawOpen, setRawOpen] = useState(false);
  if (event.data === undefined) return null;
  const graderData = event.type === 'GRADERS' ? readTraceGraderData(event.data) : undefined;
  const rawData = <TraceEventJson data={event.data} />;
  if (!graderData) return rawData;
  return (
    <>
      <StageTraceGraders data={graderData} />
      <details
        className={cx('graders__raw')}
        onToggle={(event) => setRawOpen(event.currentTarget.open)}
      >
        <summary>{formatMessage(messages.eventData)}</summary>
        {isRawOpen && rawData}
      </details>
    </>
  );
};
