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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
} from 'controllers/pages';
import type { ReducedPipelineIterationDetail } from 'controllers/aiFactory/pipelines';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import type { StageTracePageRoute } from 'pages/inside/aiFactory/stageTracePage/stageTracePageUtils';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceHeaderProps {
  route: StageTracePageRoute;
  projectName: string;
  iteration?: ReducedPipelineIterationDetail;
  attempt?: StageTraceAttempt;
  fixRound?: number;
  isLoading: boolean;
  onBack: () => void;
  onRefresh: () => void;
}
const cx = createClassnames(styles);
export const StageTraceHeader = ({
  route,
  projectName,
  iteration,
  attempt,
  fixRound,
  isLoading,
  onBack,
  onRefresh,
}: StageTraceHeaderProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug, pipelineId, iterationId, stageKey } = route;
  const stage = iteration?.stages.find((item) => item.stageKey === stageKey);
  const iterationTitle = iteration
    ? formatMessage(messages.iteration, { number: iteration.number })
    : formatMessage(messages.iterationId, { id: iterationId });
  const stageTitle = stage?.label ?? stageKey;
  const title = [
    formatMessage(messages.title),
    iteration?.pipelineName ?? formatMessage(messages.pipeline, { id: pipelineId }),
    iterationTitle,
    stageTitle,
    fixRound && formatMessage(messages.fixRound, { number: fixRound }),
  ]
    .filter(Boolean)
    .join(' · ');
  const projectPayload = { organizationSlug, projectSlug };
  const status = attempt?.stageStatus ?? attempt?.stageStatusCategory;
  return (
    <div className={cx('header')}>
      <PageHeaderWithBreadcrumbsAndActions
        title={title}
        stackActionsAtNarrowWidth
        breadcrumbDescriptors={[
          {
            id: 'project',
            title: projectName || projectSlug,
            onClick: () => dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: projectPayload }),
          },
          {
            id: 'pipelines',
            title: formatMessage(messages.pipelines),
            onClick: () => dispatch({ type: PROJECT_PIPELINES_PAGE, payload: projectPayload }),
          },
          {
            id: 'iteration',
            title: iterationTitle,
            onClick: () =>
              dispatch({
                type: PROJECT_PIPELINE_ITERATION_PAGE,
                payload: { ...projectPayload, pipelineId, iterationId },
                query: { stage: stageKey },
              }),
          },
          { id: 'trace', title: stageTitle },
        ]}
        titleAddon={
          status && (
            <span
              className={cx('status', {
                'status--failed': attempt.stageStatusCategory === 'FAILED',
                'status--passed': attempt.stageStatusCategory === 'PASSED',
              })}
            >
              {status}
            </span>
          )
        }
        actions={
          <div className={cx('header__actions')}>
            <Button variant="text" onClick={onBack} data-automation-id="backFromStageTrace">
              {formatMessage(messages.back)}
            </Button>
            <Button
              variant="text"
              icon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={isLoading}
              data-automation-id="refreshStageTrace"
            >
              {formatMessage(messages.refresh)}
            </Button>
          </div>
        }
      />
    </div>
  );
};
