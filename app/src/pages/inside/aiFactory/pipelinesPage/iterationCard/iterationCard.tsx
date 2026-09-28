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

import { createClassnames, formatCost } from 'common/utils';
import { PROJECT_PIPELINE_ITERATION_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  STAGE_LABEL_MESSAGE,
  IterationStatusBadge,
  StageStatusDot,
  outcome,
  requirementOrTestCasesLabel,
  stageMetric,
  startedAndDuration,
} from 'pages/inside/aiFactory/common';
import { ProjectDetails } from 'pages/organization/constants';
import { AiPipelineType, IterationSummaryRS, PipelineType, StageSummaryRS } from 'types/aiFactory';

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
    const metric = stageMetric(stage, iteration.testCasesCount);
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

  const outcomeText = () => {
    const data = outcome(pipelineType, iteration);
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
    requirementOrTestCasesLabel(iteration),
    iteration.trigger,
    iteration.model,
    formatMessage(messages.metaTestCasesCount, { count: iteration.testCasesCount }),
    pipelineType === PipelineType.GENERATION && iteration.suiteScore !== undefined
      ? formatMessage(messages.metaSuiteScore, { score: iteration.suiteScore })
      : undefined,
    formatCost(iteration.costTotal),
    startedAndDuration(iteration),
  ].filter(Boolean);

  return (
    <div className={cx('card')} data-automation-id="iterationCard">
      <div className={cx('card__header')}>
        <IterationStatusBadge status={iteration.status} />
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
      <div className={cx('card__outcome')}>{outcomeText()}</div>
      <div className={cx('card__meta')}>{metaFields.join(' · ')}</div>
      <div className={cx('card__stages')}>
        {iteration.stages.map((stage) => {
          const metricLabel = formatStageMetric(stage);
          return (
            <span key={stage.key} className={cx('card__stage-chip')}>
              <StageStatusDot status={stage.status} />
              {formatMessage(STAGE_LABEL_MESSAGE[stage.key])}
              {metricLabel ? ` · ${metricLabel}` : ''}
            </span>
          );
        })}
      </div>
      {iteration.attributes.length > 0 && (
        <div className={cx('card__attributes')}>
          {iteration.attributes.map((attribute) => (
            <span key={attribute.key} className={cx('card__attribute-chip')}>
              {`${attribute.key}: ${attribute.value}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
