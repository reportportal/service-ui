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

import { createClassnames, formatCost } from 'common/utils';
import { PROJECT_PIPELINE_ITERATION_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  STAGE_LABEL_MESSAGE,
  IterationStatusBadge,
  StageStatusDot,
  outcome,
  stageMetric,
  startedAndDuration,
} from 'pages/inside/aiFactory/common';
import { ProjectDetails } from 'pages/organization/constants';
import {
  AiPipelineType,
  IterationStatus,
  IterationSummaryRS,
  PipelineType,
  StageKey,
  StageStatus,
  StageSummaryRS,
} from 'types/aiFactory';

import { messages } from '../messages';
import styles from './iterationCard.scss';

const cx = createClassnames(styles);

export interface IterationCardProps {
  pipelineType: AiPipelineType;
  iteration: IterationSummaryRS;
}

export const IterationCard = ({ pipelineType, iteration }: IterationCardProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;

  const formatStageMetric = (stage: StageSummaryRS): string | null => {
    let metric = stageMetric(stage, iteration.testCasesCount);
    if (!metric && stage.key === StageKey.CREATE) {
      metric = { kind: 'cases', count: iteration.testCasesCount };
    } else if (!metric && stage.key === StageKey.UPLOAD && stage.status === StageStatus.PASSED) {
      metric = { kind: 'cases', count: iteration.testCasesCount };
    } else if (!metric && stage.key === StageKey.GRADE && iteration.suiteScore !== undefined) {
      metric = { kind: 'score', score: iteration.suiteScore };
    } else if (!metric && stage.key === StageKey.REVIEW && iteration.readyCount !== undefined) {
      metric = {
        kind: 'ready',
        ready: iteration.readyCount,
        total: iteration.testCasesCount,
      };
    }
    if (!metric) {
      return null;
    }
    switch (metric.kind) {
      case 'cases':
        return formatMessage(messages.stageMetricCases, { count: metric.count });
      case 'score':
        return formatMessage(messages.stageMetricScore, { score: metric.score });
      case 'ready':
        return formatMessage(messages.stageMetricReady, { ready: metric.ready, total: metric.total });
      default:
        return null;
    }
  };

  const outcomeData = outcome(pipelineType, iteration);
  const outcomeText = () => {
    const data = outcomeData;
    if (data.kind === 'generationReady') {
      const fixRoundsSuffix =
        data.fixRounds > 0 ? formatMessage(messages.outcomeFixRounds, { count: data.fixRounds }) : '';
      return `${formatMessage(messages.outcomeReady, { ready: data.ready, total: data.total })}${fixRoundsSuffix}`;
    }
    if (data.kind === 'automationRunning') {
      return formatMessage(messages.outcomeAutomating, { count: data.total });
    }
    const launchSuffix =
      data.launchNumber !== undefined
        ? formatMessage(messages.outcomeLaunch, { number: data.launchNumber })
        : '';
    return `${formatMessage(messages.outcomeImplemented, { implemented: data.implemented, total: data.total })}${launchSuffix}`;
  };

  const metaFields = [
    iteration.requirement
      ? {
          key: 'requirement',
          label: formatMessage(messages.metaRequirementLabel),
          value: `${iteration.requirement.specId} · ${iteration.requirement.title}`,
        }
      : undefined,
    iteration.testCases?.length
      ? {
          key: 'testCases',
          label: formatMessage(messages.metaCasesLabel),
          value: iteration.testCases.map(({ displayId }) => displayId).join(', '),
        }
      : undefined,
    {
      key: 'trigger',
      label: formatMessage(messages.metaTriggerLabel),
      value: iteration.trigger,
    },
    {
      key: 'model',
      label: formatMessage(messages.metaModelLabel),
      value: iteration.model,
    },
    {
      key: 'testCasesCount',
      label: formatMessage(messages.metaTestCasesLabel),
      value: String(iteration.testCasesCount),
    },
    pipelineType === PipelineType.GENERATION && iteration.suiteScore !== undefined
      ? {
          key: 'suiteScore',
          label: formatMessage(messages.metaSuiteScoreLabel),
          value: String(iteration.suiteScore),
        }
      : undefined,
    {
      key: 'cost',
      label: formatMessage(messages.metaCostLabel),
      value: formatCost(iteration.costTotal),
    },
    {
      key: 'started',
      label: formatMessage(messages.metaStartedLabel),
      value: startedAndDuration(iteration),
    },
  ].filter((field): field is { key: string; label: string; value: string } => Boolean(field));

  let outcomeVariant = 'neutral';
  if (iteration.status === IterationStatus.FAILED) {
    outcomeVariant = 'failed';
  } else if (outcomeData.kind === 'generationReady' && outcomeData.ready > 0) {
    outcomeVariant = 'ready';
  } else if (iteration.status === IterationStatus.RUNNING) {
    outcomeVariant = 'active';
  } else if (iteration.status === IterationStatus.COMPLETED) {
    outcomeVariant = 'done';
  }

  const iterationTitle = formatMessage(messages.iterationTitle, { number: iteration.number });

  return (
    <Link
      className={cx('card')}
      data-automation-id="iterationCard"
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
        <IterationStatusBadge status={iteration.status} />
        <span className={cx('card__title')}>{iterationTitle}</span>
        <div className={cx('card__outcome', `card__outcome--${outcomeVariant}`)}>
          {outcomeText()}
        </div>
      </div>
      <div className={cx('card__meta')}>
        {metaFields.map((field) => (
          <span key={field.key} className={cx('card__meta-field')}>
            <span className={cx('card__meta-label')}>{field.label}</span>
            <span className={cx('card__meta-value')}>{field.value}</span>
          </span>
        ))}
      </div>
      <div className={cx('card__stages')}>
        {iteration.stages.map((stage, index) => {
          const metricLabel = formatStageMetric(stage);
          return (
            <Fragment key={stage.key}>
              {index > 0 && (
                <span className={cx('card__stage-arrow')} aria-hidden="true">
                  →
                </span>
              )}
              <span className={cx('card__stage-chip')}>
                <StageStatusDot status={stage.status} />
                <span className={cx('card__stage-label')}>
                  {formatMessage(STAGE_LABEL_MESSAGE[stage.key])}
                </span>
                {metricLabel && (
                  <span className={cx('card__stage-metric')}>{metricLabel}</span>
                )}
              </span>
            </Fragment>
          );
        })}
      </div>
      {iteration.attributes.length > 0 && (
        <div className={cx('card__attributes')}>
          {iteration.attributes.map((attribute) => (
            <span key={attribute.key} className={cx('card__attribute-chip')}>
              <span className={cx('card__attribute-key')}>{`${attribute.key}:`}</span>
              <span className={cx('card__attribute-value')}>{attribute.value}</span>
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};
