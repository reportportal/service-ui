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
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { formatDuration } from 'common/utils/timeDateUtils';
import { ReducedPipelineIteration, ReducedPipelineStatus } from 'controllers/aiFactory/pipelines';
import {
  PROJECT_PIPELINE_ITERATION_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import {
  getIterationFixLabel,
  isFixIteration,
} from 'controllers/aiFactory/pipelines/iterationProvenance';
import { ProjectDetails } from 'pages/organization/constants';

import { getReducedStatusVariant } from '../../common/reducedStatusVariant';
import { messages } from '../messages';
import styles from './iterationCard.scss';

const cx = createClassnames(styles);

const STATUS_MESSAGE_KEYS: Record<ReducedPipelineStatus, keyof typeof messages> = {
  PENDING: 'liveStatusPending',
  RUNNING: 'liveStatusRunning',
  WAITING: 'liveStatusWaiting',
  PASSED: 'liveStatusPassed',
  FAILED: 'liveStatusFailed',
  NEEDS_HUMAN: 'liveStatusNeedsHuman',
  SKIPPED: 'liveStatusSkipped',
  UNKNOWN: 'liveStatusUnknown',
};

export interface ReducedIterationCardProps {
  iteration: ReducedPipelineIteration;
  pipelineName: string;
}

const buildFixMetadata = (
  iteration: ReducedPipelineIteration,
  formatMessage: ReturnType<typeof useIntl>['formatMessage'],
) => [
  {
    value: isFixIteration(iteration.attributes) ? formatMessage(messages.fixIteration) : undefined,
  },
  { value: getIterationFixLabel(iteration.attributes) },
  {
    label: formatMessage(messages.sourceIterationLabel),
    value: iteration.rerunOf?.iterationNumber
      ? formatMessage(messages.iterationTitle, { number: iteration.rerunOf.iterationNumber })
      : undefined,
  },
];

export const ReducedIterationCard = ({ iteration, pipelineName }: ReducedIterationCardProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const statusLabel = (status: ReducedPipelineStatus) =>
    formatMessage(messages[STATUS_MESSAGE_KEYS[status]]);
  const attributeValue = (key: string) =>
    iteration.attributes.find((attribute) => attribute.key === key)?.value;
  const metaFields = [
    ...buildFixMetadata(iteration, formatMessage),
    { label: formatMessage(messages.metaRequirementLabel), value: attributeValue('requirement') },
    { label: formatMessage(messages.metaTriggerLabel), value: iteration.trigger },
    { label: formatMessage(messages.metaModelLabel), value: attributeValue('model') },
    { label: formatMessage(messages.metaTestCasesLabel), value: attributeValue('testCases') },
    { label: formatMessage(messages.metaSuiteScoreLabel), value: attributeValue('suiteScore') },
    { label: formatMessage(messages.metaCostLabel), value: attributeValue('cost') },
    {
      label: formatMessage(messages.metaStartedLabel),
      value:
        iteration.startedAt !== undefined
          ? new Date(iteration.startedAt).toLocaleString()
          : undefined,
    },
    {
      value: iteration.durationMs !== undefined ? formatDuration(iteration.durationMs) : undefined,
    },
  ].filter((field) => field.value);
  const currentStage = [...iteration.stages]
    .reverse()
    .find(
      (stage) =>
        stage.attributes?.some((attribute) => attribute.key === 'ready') &&
        stage.attributes?.some((attribute) => attribute.key === 'total'),
    );
  const ready = currentStage?.attributes?.find((attribute) => attribute.key === 'ready')?.value;
  const total = currentStage?.attributes?.find((attribute) => attribute.key === 'total')?.value;
  const outcome =
    ready !== undefined && total !== undefined
      ? formatMessage(messages.outcomeReady, { ready, total })
      : undefined;
  const tags = iteration.attributes.filter((attribute) => attribute.type === 'TAG');

  const iterationTitle = formatMessage(messages.pipelineIterationTitle, {
    pipelineName,
    number: iteration.number,
  });

  return (
    <Link
      className={cx('card')}
      data-automation-id="reducedIterationCard"
      aria-label={iterationTitle}
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
      <div className={cx('card__header')}>
        <span
          className={cx(
            'card__neutral-status',
            `status--${getReducedStatusVariant(iteration.status)}`,
          )}
        >
          {iteration.statusText ?? statusLabel(iteration.status)}
        </span>
        <span className={cx('card__title')}>
          {pipelineName} ·{' '}
          <span className={cx('card__title-iteration')}>
            {formatMessage(messages.iterationTitle, { number: iteration.number })}
          </span>
        </span>
        {outcome && (
          <span
            className={cx(
              'card__outcome',
              `card__outcome--${getReducedStatusVariant(iteration.status)}`,
            )}
          >
            {outcome}
          </span>
        )}
      </div>
      {metaFields.length > 0 && (
        <div className={cx('card__meta')}>
          {metaFields.map(({ label, value }) => (
            <span key={label ?? value} className={cx('card__meta-field')}>
              {label && <span className={cx('card__meta-label')}>{label}</span>}
              <span className={cx('card__meta-value')}>{value}</span>
            </span>
          ))}
        </div>
      )}
      {iteration.stages.length > 0 && (
        <div className={cx('card__stages')}>
          {iteration.stages.map((stage, index) => (
            <Fragment key={stage.key}>
              {index > 0 && (
                <span className={cx('card__stage-arrow')} aria-hidden="true">
                  →
                </span>
              )}
              <span className={cx('card__stage-chip', 'card__stage-chip--reduced')}>
                <span
                  className={cx(
                    'card__stage-dot',
                    `status--${getReducedStatusVariant(stage.status)}`,
                  )}
                  aria-hidden="true"
                />
                <span className={cx('card__stage-label')}>{stage.label}</span>
                {' · '}
                <span className={cx('card__stage-metric')}>
                  {stage.summary ?? stage.statusText ?? statusLabel(stage.status)}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      )}
      {tags.length > 0 && (
        <div className={cx('card__attributes')}>
          {tags.map((attribute) => (
            <span key={attribute.key} className={cx('card__attribute-chip')}>
              <span className={cx('card__attribute-key')}>{attribute.key}:</span>
              <span className={cx('card__attribute-value')}>{attribute.value}</span>
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
