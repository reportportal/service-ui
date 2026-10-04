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
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { formatDuration } from 'common/utils/timeDateUtils';
import { ReducedPipelineIteration, ReducedPipelineStatus } from 'controllers/aiFactory/pipelines';
import {
  PROJECT_PIPELINE_ITERATION_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import { messages } from '../messages';
import styles from './iterationCard.scss';

const cx = createClassnames(styles);

const STATUS_MESSAGE_KEYS: Record<ReducedPipelineStatus, keyof typeof messages> = {
  PENDING: 'liveStatusPending',
  PASSED: 'liveStatusPassed',
  FAILED: 'liveStatusFailed',
  NEEDS_HUMAN: 'liveStatusNeedsHuman',
  UNKNOWN: 'liveStatusUnknown',
};

export interface ReducedIterationCardProps {
  iteration: ReducedPipelineIteration;
}

export const ReducedIterationCard = ({ iteration }: ReducedIterationCardProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const statusLabel = (status: ReducedPipelineStatus) =>
    formatMessage(messages[STATUS_MESSAGE_KEYS[status]]);
  const metaFields = [
    iteration.trigger,
    iteration.startedAt ? new Date(iteration.startedAt).toLocaleString() : undefined,
    iteration.durationMs !== undefined ? formatDuration(iteration.durationMs) : undefined,
  ].filter(Boolean);

  return (
    <div className={cx('card')} data-automation-id="reducedIterationCard">
      <div className={cx('card__header')}>
        <span className={cx('card__neutral-status')}>{statusLabel(iteration.status)}</span>
        <Link
          className={cx('card__title')}
          to={{
            type: PROJECT_PIPELINE_ITERATION_PAGE,
            payload: {
              organizationSlug,
              projectSlug,
              pipelineId: iteration.pipelineId,
              iterationId: iteration.id,
            },
          }}
        >
          {formatMessage(messages.iterationTitle, { number: iteration.number })}
        </Link>
      </div>
      {metaFields.length > 0 && <div className={cx('card__meta')}>{metaFields.join(' · ')}</div>}
      {iteration.stages.length > 0 && (
        <div className={cx('card__stages')}>
          {iteration.stages.map((stage) => (
            <span key={stage.key} className={cx('card__stage-chip')}>
              {stage.label} · {statusLabel(stage.status)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
