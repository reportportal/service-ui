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

import { createClassnames } from 'common/utils';
import { isHttpUrl } from 'common/utils/isHttpUrl';
import { formatDuration } from 'common/utils/timeDateUtils';
import type {
  ReducedPipelineIterationDetail,
  ReducedPipelineDetailStage,
  ReducedPipelineStageAttempt,
} from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import {
  findAttemptSnapshot,
  formatSnapshotAttribute,
  getTokenUsageFields,
} from 'pages/inside/aiFactory/stageTracePage/stageTraceSnapshotUtils';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceSnapshotProps {
  iteration?: ReducedPipelineIterationDetail;
  stageKey: string;
  attempt?: StageTraceAttempt;
  hasError?: boolean;
}
const cx = createClassnames(styles);
interface SnapshotFieldsProps {
  snapshot: ReducedPipelineStageAttempt | ReducedPipelineDetailStage;
}
const SnapshotFields = ({ snapshot }: SnapshotFieldsProps) => {
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
          <dd>{formatSnapshotAttribute(attribute)}</dd>
        </Fragment>
      ))}
      {getTokenUsageFields(snapshot.sections).map((field) => (
        <Fragment key={field.key}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </Fragment>
      ))}
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
