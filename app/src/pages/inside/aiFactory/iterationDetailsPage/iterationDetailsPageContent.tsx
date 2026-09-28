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

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, RefreshIcon, SystemMessage } from '@reportportal/ui-kit';
import Link from 'redux-first-router-link';

import { createClassnames, formatCost } from 'common/utils';
import {
  getPipelineIterationDetailsAction,
  getPipelinesAction,
  pipelineIterationDetailsLoadingSelector,
  pipelineIterationDetailsSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINES_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  iterationIdSelector,
  pipelineIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { usePolling } from 'pages/inside/aiFactory/common';
import { ProjectDetails } from 'pages/organization/constants';
import { AiStageKey, IterationStatus, StageKey } from 'types/aiFactory';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { KpiTile } from './kpiTile';
import { StageCards } from './stageCards';
import { StagePanels } from './stagePanels';
import { buildKpis, defaultStageKey, draftCasesCount, failedStage } from './iterationDetailsUtils';
import { messages } from './messages';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);

const ITERATION_POLL_INTERVAL_MS = 5000;

const STAGE_KEYS = new Set<string>(Object.values(StageKey));

export const IterationDetailsPageContent = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const pipelineId = useSelector(pipelineIdSelector);
  const iterationId = useSelector(iterationIdSelector);
  const query = useSelector(querySelector);
  const pipelines = useSelector(pipelinesSelector);
  const iteration = useSelector(pipelineIterationDetailsSelector);
  const isLoading = useSelector(pipelineIterationDetailsLoadingSelector);

  const pipeline = pipelines?.find((p) => p.id === pipelineId);
  const [selectedStage, setSelectedStage] = useState<AiStageKey | null>(null);
  const hasInitializedStage = useRef(false);

  useEffect(() => {
    if (!pipelines) {
      dispatch(getPipelinesAction());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasInitializedStage.current || !pipeline) {
      return;
    }
    const requestedStage = typeof query.stage === 'string' ? query.stage.toUpperCase() : undefined;
    setSelectedStage(
      requestedStage && STAGE_KEYS.has(requestedStage)
        ? (requestedStage as AiStageKey)
        : defaultStageKey(pipeline.type),
    );
    hasInitializedStage.current = true;
  }, [pipeline, query.stage]);

  usePolling(
    () => dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId)),
    ITERATION_POLL_INTERVAL_MS,
    iteration?.status === IterationStatus.RUNNING,
  );

  const breadcrumbDescriptors = [
    {
      id: 'project',
      title: projectName,
      onClick: () =>
        dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } }),
    },
    {
      id: 'pipelines',
      title: formatMessage(messages.pipelinesBreadcrumb),
      onClick: () =>
        dispatch({ type: PROJECT_PIPELINES_PAGE, payload: { organizationSlug, projectSlug } }),
    },
  ];

  const renderBanner = () => {
    if (!iteration) {
      return null;
    }
    if (iteration.status === IterationStatus.RUNNING) {
      return <SystemMessage mode="info">{formatMessage(messages.bannerRunning)}</SystemMessage>;
    }
    if (iteration.status === IterationStatus.IN_REVIEW) {
      const draftCount = draftCasesCount(iteration);
      return (
        <SystemMessage mode="info">
          {formatMessage(messages.bannerInReview, { count: draftCount })}
          {' · '}
          <Link
            to={{
              type: TEST_CASE_LIBRARY_PAGE,
              payload: { organizationSlug, projectSlug },
              query: { lifecycle: 'DRAFT', ai: 'AI', iteration: String(iteration.id) },
            }}
          >
            {formatMessage(messages.openReviewQueue)}
          </Link>
        </SystemMessage>
      );
    }
    if (iteration.status === IterationStatus.FAILED) {
      const failing = failedStage(iteration);
      return (
        <SystemMessage mode="error">
          {failing?.failureReason || formatMessage(messages.bannerFailedGeneric)}
        </SystemMessage>
      );
    }
    return null;
  };

  if (isLoading && !iteration) {
    return (
      <SettingsLayout>
        <SpinningPreloader />
      </SettingsLayout>
    );
  }

  if (!iteration || !pipeline) {
    return null;
  }

  const currentStage = iteration.stages.find((stage) => stage.key === selectedStage) || iteration.stages[0];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.iterationTitle, { number: iteration.number })}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <Button
              variant="text"
              data-automation-id="refreshIterationButton"
              icon={<RefreshIcon />}
              disabled={isLoading}
              onClick={() => dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId))}
            >
              {formatMessage(messages.refresh)}
            </Button>
          }
        />
        <div className={cx('content')}>
          <div>
            <div className={cx('meta')}>
              {[iteration.trigger, iteration.model, iteration.environment].filter(Boolean).join(' · ')}
            </div>
            {iteration.attributes.length > 0 && (
              <div className={cx('attributes')}>
                {iteration.attributes.map((attribute) => (
                  <span key={attribute.key} className={cx('attributes__chip')}>
                    {`${attribute.key}: ${attribute.value}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={cx('kpis')}>
            {buildKpis(pipeline.type, iteration).map((kpi) => (
              <KpiTile
                key={kpi.key}
                label={formatMessage(messages[kpi.key as keyof typeof messages])}
                value={kpi.key === 'kpiCost' ? formatCost(kpi.value as number) : kpi.value}
              />
            ))}
          </div>
          {renderBanner()}
          <StageCards
            stages={iteration.stages}
            testCasesCount={iteration.testCasesCount}
            selectedStage={selectedStage || defaultStageKey(pipeline.type)}
            onSelect={setSelectedStage}
          />
          {currentStage && (
            <div className={cx('panel-card')}>
              <StagePanels stage={currentStage} iteration={iteration} />
            </div>
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
