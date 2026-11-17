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

import { Fragment } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames, formatCost, formatTokens } from 'common/utils';
import { formatDuration } from 'common/utils/timeDateUtils';
import type {
  ReducedPipelineIterationDetail,
  ReducedPipelineDetailStage,
  ReducedPipelineStageAttempt,
  ReducedPipelineAttribute,
} from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceSnapshotProps {
  iteration?: ReducedPipelineIterationDetail;
  stageKey: string;
  attempt?: StageTraceAttempt;
  hasError?: boolean;
}
const cx = createClassnames(styles);
export const findAttemptSnapshot = (
  stage: ReducedPipelineDetailStage | undefined,
  attempt: StageTraceAttempt | undefined,
) => {
  if (!stage || !attempt) return undefined;
  if (stage.attempt === attempt.attempt) return stage;
  return stage.attempts?.find((item) => item.attempt === attempt.attempt);
};
const isHttpUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const formatAttribute = (attribute: ReducedPipelineAttribute) => {
  if (attribute.value.trim() === '') return attribute.value;
  const value = Number(attribute.value);
  if (!Number.isFinite(value)) return attribute.value;
  if (attribute.valueType === 'MONEY') return formatCost(value);
  if (attribute.valueType === 'NUMBER') return formatTokens(value);
  return attribute.value;
};
const SnapshotFields = ({
  snapshot,
}: {
  snapshot: ReducedPipelineStageAttempt | ReducedPipelineDetailStage;
}) => {
  const { formatMessage } = useIntl();
  return (
    <dl className={cx('snapshot__fields')}>
      {snapshot.durationMs !== undefined && (
        <>
          <dt>{formatMessage(messages.duration)}</dt>
          <dd>{formatDuration(snapshot.durationMs)}</dd>
        </>
      )}
      {snapshot.links
        ?.filter((link) => link.type === 'RUN')
        .map((link) => (
          <Fragment key={link.url}>
            <dt>{formatMessage(messages.ciRun)}</dt>
            <dd>
              {isHttpUrl(link.url) ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                link.label
              )}
            </dd>
          </Fragment>
        ))}
      {snapshot.attributes?.map((attribute) => (
        <Fragment key={attribute.key}>
          <dt title={attribute.description}>{attribute.label ?? attribute.key}</dt>
          <dd>{formatAttribute(attribute)}</dd>
        </Fragment>
      ))}
      {snapshot.sections
        ?.filter((section) => section.key === 'tokenUsage')
        .flatMap((section) =>
          section.rows.flatMap((row) =>
            section.columns.map((column) => (
              <Fragment key={`${section.key}-${row.key}-${column.key}`}>
                <dt>{column.label}</dt>
                <dd>
                  {formatAttribute({
                    key: column.key,
                    value: row.cells[column.key] ?? '—',
                    valueType: column.valueType,
                  })}
                </dd>
              </Fragment>
            )),
          ),
        )}
    </dl>
  );
};
export const StageTraceSnapshot = ({
  iteration,
  stageKey,
  attempt,
  hasError,
}: StageTraceSnapshotProps) => {
  const { formatMessage } = useIntl();
  const stage = iteration?.stages.find((item) => item.stageKey === stageKey);
  const snapshot = findAttemptSnapshot(stage, attempt);
  const contextAttributes =
    iteration?.attributes.filter((attribute) =>
      ['model', 'env', 'environment', 'ci'].includes(attribute.key),
    ) ?? [];
  return (
    <aside className={cx('snapshot')}>
      <h2>{formatMessage(messages.snapshot)}</h2>
      {hasError && <p>{formatMessage(messages.metadataError)}</p>}
      {snapshot ? (
        <SnapshotFields snapshot={snapshot} />
      ) : (
        <p>{formatMessage(messages.snapshotUnavailable)}</p>
      )}
      {(iteration?.trigger || contextAttributes.length > 0) && (
        <section className={cx('snapshot__context')}>
          <h3>{formatMessage(messages.iterationContext)}</h3>
          <dl className={cx('snapshot__fields')}>
            {iteration?.trigger && (
              <>
                <dt>{formatMessage(messages.trigger)}</dt>
                <dd>{iteration.trigger}</dd>
              </>
            )}
            {contextAttributes.map((attribute) => (
              <Fragment key={attribute.key}>
                <dt>{attribute.label ?? attribute.key}</dt>
                <dd>{attribute.value}</dd>
              </Fragment>
            ))}
          </dl>
        </section>
      )}
    </aside>
  );
};
