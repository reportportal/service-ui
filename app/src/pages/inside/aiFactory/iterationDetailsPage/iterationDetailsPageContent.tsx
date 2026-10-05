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
  isReducedPipeline,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelineIterationDetailsLoadingSelector,
  pipelineIterationDetailsErrorSelector,
  pipelineIterationDetailsSelector,
  pipelineIterationDetailsUnavailableSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
  ReducedPipelineIterationDetail,
} from 'controllers/aiFactory/pipelines';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINE_COMPARISON_PAGE,
  PROJECT_PIPELINES_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  iterationIdSelector,
  pipelineIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectKeySelector, projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  POLLING_REQUEST_STARTED,
  STAGE_LABEL_MESSAGE,
  usePolling,
} from 'pages/inside/aiFactory/common';
import { ProjectDetails } from 'pages/organization/constants';
import { AiStageKey, IterationRS, IterationStatus, StageKey } from 'types/aiFactory';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PipelineSettingsButton } from '../pipelineSettings';
import { KpiTile } from './kpiTile';
import { StageCards } from './stageCards';
import { StagePanels } from './stagePanels';
import { buildKpis, defaultStageKey, draftCasesCount, runningStage } from './iterationDetailsUtils';
import { messages } from './messages';
import { ReducedIterationDetails } from './reducedIterationDetails';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);

const ITERATION_POLL_INTERVAL_MS = 5000;

const STAGE_KEYS = new Set<string>(Object.values(StageKey));

const isReducedDetail = (
  iteration: IterationRS | ReducedPipelineIterationDetail | null,
): iteration is ReducedPipelineIterationDetail =>
  Boolean(iteration && 'kind' in iteration && iteration.kind === 'reduced');

export const IterationDetailsPageContent = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const projectKey = useSelector(projectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const pipelineId = useSelector(pipelineIdSelector);
  const iterationId = useSelector(iterationIdSelector);
  const query = useSelector(querySelector);
  const pipelines = useSelector(pipelinesSelector);
  const catalogProjectKey = useSelector(pipelineCatalogProjectKeySelector);
  const catalogTransport = useSelector(pipelineCatalogTransportSelector);
  const catalogVersion = useSelector(pipelineCatalogVersionSelector);
  const catalogRequestId = useSelector(pipelineCatalogRequestIdSelector);
  const iteration = useSelector(pipelineIterationDetailsSelector);
  const isLoading = useSelector(pipelineIterationDetailsLoadingSelector);
  const hasDetailError = useSelector(pipelineIterationDetailsErrorSelector);
  const isDetailUnavailable = useSelector(pipelineIterationDetailsUnavailableSelector);
  const isCatalogLoading = useSelector(pipelinesLoadingSelector);
  const currentIteration =
    iteration?.id === iterationId && iteration.pipelineId === pipelineId ? iteration : null;

  const hasCurrentCatalog = catalogVersion > 0 && catalogProjectKey === projectKey;
  const pipelineCandidate = hasCurrentCatalog
    ? pipelines?.find((item) => item.id === pipelineId)
    : undefined;
  const pipeline =
    pipelineCandidate && !isReducedPipeline(pipelineCandidate) ? pipelineCandidate : undefined;
  const isReducedCatalogPipeline = Boolean(
    pipelineCandidate && isReducedPipeline(pipelineCandidate),
  );
  const [selectedStage, setSelectedStage] = useState<AiStageKey | null>(null);
  const hasInitializedStage = useRef(false);
  const catalogRequestProjectRef = useRef<string | null>(null);
  const detailRequestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasCurrentCatalog && catalogRequestProjectRef.current !== projectKey) {
      catalogRequestProjectRef.current = projectKey;
      dispatch(getPipelinesAction());
    }
  }, [dispatch, hasCurrentCatalog, projectKey]);

  useEffect(() => {
    const requestKey = `${projectKey}:${catalogTransport}:${catalogVersion}:${catalogRequestId}:${pipelineId}:${iterationId}`;
    if (
      catalogVersion <= 0 ||
      catalogProjectKey !== projectKey ||
      !pipelineCandidate ||
      isLoading ||
      currentIteration ||
      detailRequestKeyRef.current === requestKey
    ) {
      return;
    }
    detailRequestKeyRef.current = requestKey;
    dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId));
  }, [
    catalogProjectKey,
    catalogRequestId,
    catalogTransport,
    catalogVersion,
    dispatch,
    isLoading,
    currentIteration,
    iterationId,
    pipelineCandidate,
    pipelineId,
    projectKey,
  ]);

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
    () => {
      dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId));
      return POLLING_REQUEST_STARTED;
    },
    ITERATION_POLL_INTERVAL_MS,
    !isLoading &&
      Boolean(pipeline) &&
      (currentIteration?.status === IterationStatus.RUNNING ||
        currentIteration?.status === IterationStatus.IN_REVIEW),
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
    {
      id: 'iteration',
      title: currentIteration
        ? formatMessage(messages.iterationTitle, { number: currentIteration.number })
        : '',
    },
  ];

  const renderBanner = (richIteration: IterationRS) => {
    switch (richIteration.status) {
      case IterationStatus.RUNNING: {
        const running = runningStage(richIteration);
        return (
          <SystemMessage mode="info">
            {running
              ? formatMessage(messages.bannerRunningStage, {
                  stage: formatMessage(STAGE_LABEL_MESSAGE[running.key]),
                })
              : formatMessage(messages.bannerRunning)}
          </SystemMessage>
        );
      }
      case IterationStatus.COMPLETED:
        return <SystemMessage mode="info">{formatMessage(messages.bannerCompleted)}</SystemMessage>;
      case IterationStatus.IN_REVIEW: {
        const draftCount = draftCasesCount(richIteration);
        return (
          <SystemMessage mode="info">
            {formatMessage(messages.bannerInReview, { count: draftCount })}
            {' · '}
            <Link
              to={{
                type: TEST_CASE_LIBRARY_PAGE,
                payload: { organizationSlug, projectSlug },
                query: { lifecycle: 'DRAFT', ai: 'AI', iteration: String(richIteration.id) },
              }}
            >
              {formatMessage(messages.openReviewQueue)}
            </Link>
          </SystemMessage>
        );
      }
      case IterationStatus.FAILED:
        return (
          <SystemMessage mode="error">{formatMessage(messages.bannerFailedGeneric)}</SystemMessage>
        );
      default:
        return null;
    }
  };

  const retryDetail = () => {
    dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId));
  };

  if ((isCatalogLoading || isLoading) && !currentIteration) {
    return (
      <SettingsLayout>
        <output className={cx('state')} aria-live="polite">
          <SpinningPreloader />
          <span>{formatMessage(messages.detailLoading)}</span>
        </output>
      </SettingsLayout>
    );
  }

  if (isReducedCatalogPipeline) {
    return (
      <ReducedIterationDetails
        iteration={isReducedDetail(currentIteration) ? currentIteration : null}
        hasError={hasDetailError}
        isUnavailable={isDetailUnavailable}
        breadcrumbDescriptors={breadcrumbDescriptors}
        onRetry={retryDetail}
      />
    );
  }

  if (!currentIteration || isReducedDetail(currentIteration) || !pipeline) {
    return null;
  }

  const richIteration = currentIteration;

  const currentStage =
    richIteration.stages.find((stage) => stage.key === selectedStage) || richIteration.stages[0];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.iterationTitle, { number: richIteration.number })}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <div className={cx('header-actions')}>
              {richIteration.previousIterationId !== undefined && (
                <Button
                  variant="text"
                  data-automation-id="compareWithPreviousButton"
                  onClick={() =>
                    dispatch({
                      type: PROJECT_PIPELINE_COMPARISON_PAGE,
                      payload: { organizationSlug, projectSlug },
                      query: {
                        pipeline: String(pipelineId),
                        baseline: String(richIteration.previousIterationId),
                        candidate: String(iterationId),
                      },
                    })
                  }
                >
                  {formatMessage(messages.compareWithPrevious)}
                </Button>
              )}
              <PipelineSettingsButton pipeline={pipeline} />
              <Button
                variant="text"
                data-automation-id="refreshIterationButton"
                icon={<RefreshIcon />}
                disabled={isLoading}
                onClick={() => dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId))}
              >
                {formatMessage(messages.refresh)}
              </Button>
            </div>
          }
        />
        <div className={cx('content')}>
          <div>
            <div className={cx('meta')}>
              {[richIteration.trigger, richIteration.model, richIteration.environment]
                .filter(Boolean)
                .join(' · ')}
            </div>
            {richIteration.attributes.length > 0 && (
              <div className={cx('attributes')}>
                {richIteration.attributes.map((attribute) => (
                  <span key={attribute.key} className={cx('attributes__chip')}>
                    {`${attribute.key}: ${attribute.value}`}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={cx('kpis')}>
            {buildKpis(pipeline.type, richIteration).map((kpi) => (
              <KpiTile
                key={kpi.key}
                label={formatMessage(messages[kpi.key as keyof typeof messages])}
                value={kpi.key === 'kpiCost' ? formatCost(kpi.value as number) : kpi.value}
              />
            ))}
          </div>
          {renderBanner(richIteration)}
          <StageCards
            stages={richIteration.stages}
            testCasesCount={richIteration.testCasesCount}
            selectedStage={selectedStage || defaultStageKey(pipeline.type)}
            onSelect={setSelectedStage}
          />
          {currentStage && (
            <div className={cx('panel-card')}>
              <StagePanels stage={currentStage} iteration={richIteration} />
            </div>
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
