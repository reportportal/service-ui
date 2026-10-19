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

import { ComponentProps, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, CycleArrowsIcon, RefreshIcon, RerunIcon } from '@reportportal/ui-kit';
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
  pipelineIterationDetailsFailureKindSelector,
  pipelineIterationDetailProjectKeySelector,
  pipelineIterationDetailPipelineIdSelector,
  pipelineIterationDetailIterationIdSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
  PipelineCatalogItem,
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
import { useUserPermissions } from 'hooks/useUserPermissions';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  POLLING_REQUEST_STARTED,
  STAGE_LABEL_MESSAGE,
  IterationStatusBadge,
  startedAndDuration,
  usePolling,
} from 'pages/inside/aiFactory/common';
import { ProjectDetails } from 'pages/organization/constants';
import { AiStageKey, IterationRS, IterationStatus, PipelineRS, StageKey } from 'types/aiFactory';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PipelineSettingsButton } from '../pipelineSettings';
import { KpiTile } from './kpiTile';
import { StageCards } from './stageCards';
import { StagePanels } from './stagePanels';
import { buildKpis, defaultStageKey, draftCasesCount, runningStage } from './iterationDetailsUtils';
import { messages } from './messages';
import { useIterationRerunModal } from './rerun';
import { ReducedIterationDetails } from './reducedIterationDetails';
import styles from './iterationDetailsPage.scss';

const cx = createClassnames(styles);

const ITERATION_POLL_INTERVAL_MS = 5000;

const STAGE_KEYS = new Set<string>(Object.values(StageKey));

type PipelineIteration = IterationRS | ReducedPipelineIterationDetail;

const isReducedDetail = (
  iteration: PipelineIteration | null,
): iteration is ReducedPipelineIterationDetail =>
  Boolean(iteration && 'kind' in iteration && iteration.kind === 'reduced');

const resolvePipelineCatalog = (
  pipelines: PipelineCatalogItem[] | null,
  pipelineId: number,
  catalogVersion: number,
  catalogProjectKey: string | null,
  projectKey: string,
) => {
  const hasCurrentCatalog = catalogVersion > 0 && catalogProjectKey === projectKey;
  const pipelineCandidate = hasCurrentCatalog
    ? pipelines?.find((item) => item.id === pipelineId)
    : undefined;
  const pipeline: PipelineRS | undefined =
    pipelineCandidate && !isReducedPipeline(pipelineCandidate) ? pipelineCandidate : undefined;
  const isReducedCatalogPipeline = Boolean(
    pipelineCandidate && isReducedPipeline(pipelineCandidate),
  );

  return { hasCurrentCatalog, pipelineCandidate, pipeline, isReducedCatalogPipeline };
};

const shouldRequestDetail = ({
  projectKey,
  hasValidRoute,
  isLiveTransport,
  catalogVersion,
  catalogProjectKey,
  pipelineCandidate,
  detailMatchesRoute,
  isLoading,
  currentIteration,
  requestKey,
  lastRequestKey,
}: {
  projectKey: string;
  hasValidRoute: boolean;
  isLiveTransport: boolean;
  catalogVersion: number;
  catalogProjectKey: string | null;
  pipelineCandidate: PipelineCatalogItem | undefined;
  detailMatchesRoute: boolean;
  isLoading: boolean;
  currentIteration: PipelineIteration | null;
  requestKey: string;
  lastRequestKey: string | null;
}) =>
  Boolean(projectKey) &&
  hasValidRoute &&
  (isLiveTransport ||
    (catalogVersion > 0 && catalogProjectKey === projectKey && pipelineCandidate)) &&
  !(detailMatchesRoute && isLoading) &&
  !currentIteration &&
  lastRequestKey !== requestKey;

const shouldRequestCatalog = (
  isLiveTransport: boolean,
  projectKey: string,
  hasCurrentCatalog: boolean,
  lastProjectKey: string | null,
) => !isLiveTransport && Boolean(projectKey) && !hasCurrentCatalog && lastProjectKey !== projectKey;

const shouldPollIteration = (
  isLiveTransport: boolean,
  isLoading: boolean,
  pipeline: PipelineRS | undefined,
  iteration: PipelineIteration | null,
) =>
  !isLiveTransport &&
  !isLoading &&
  Boolean(pipeline) &&
  (iteration?.status === IterationStatus.RUNNING ||
    iteration?.status === IterationStatus.IN_REVIEW);

const resolveDetailRouteState = ({
  pipelineId,
  iterationId,
  projectKey,
  detailProjectKey,
  detailPipelineId,
  detailIterationId,
  iteration,
  isLiveTransport,
  isCatalogLoading,
  isLoading,
}: {
  pipelineId: number;
  iterationId: number;
  projectKey: string;
  detailProjectKey: string | null;
  detailPipelineId: number | null;
  detailIterationId: number | null;
  iteration: PipelineIteration | null;
  isLiveTransport: boolean;
  isCatalogLoading: boolean;
  isLoading: boolean;
}) => {
  const hasValidRoute =
    Number.isSafeInteger(pipelineId) &&
    pipelineId > 0 &&
    Number.isSafeInteger(iterationId) &&
    iterationId > 0;
  const detailMatchesRoute =
    detailProjectKey === projectKey &&
    detailPipelineId === pipelineId &&
    detailIterationId === iterationId;
  const currentIteration =
    (!isLiveTransport || detailMatchesRoute) &&
    iteration?.id === iterationId &&
    iteration.pipelineId === pipelineId
      ? iteration
      : null;
  const isDetailPending =
    (!isLiveTransport && isCatalogLoading) ||
    (detailMatchesRoute && isLoading) ||
    (isLiveTransport && !detailMatchesRoute);
  return { hasValidRoute, detailMatchesRoute, currentIteration, isDetailPending };
};

interface DetailRequestOptions {
  dispatch: ReturnType<typeof useDispatch>;
  projectKey: string;
  pipelineId: number;
  iterationId: number;
  isLiveTransport: boolean;
  hasCurrentCatalog: boolean;
  catalogTransport: string;
  catalogVersion: number;
  catalogRequestId: number | null;
  catalogProjectKey: string | null;
  pipelineCandidate: PipelineCatalogItem | undefined;
  hasValidRoute: boolean;
  detailMatchesRoute: boolean;
  isLoading: boolean;
  currentIteration: PipelineIteration | null;
}

const useIterationDetailRequests = ({
  dispatch,
  projectKey,
  pipelineId,
  iterationId,
  isLiveTransport,
  hasCurrentCatalog,
  catalogTransport,
  catalogVersion,
  catalogRequestId,
  catalogProjectKey,
  pipelineCandidate,
  hasValidRoute,
  detailMatchesRoute,
  isLoading,
  currentIteration,
}: DetailRequestOptions) => {
  const catalogRequestProjectRef = useRef<string | null>(null);
  const detailRequestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      shouldRequestCatalog(
        isLiveTransport,
        projectKey,
        hasCurrentCatalog,
        catalogRequestProjectRef.current,
      )
    ) {
      catalogRequestProjectRef.current = projectKey;
      dispatch(getPipelinesAction());
    }
  }, [dispatch, hasCurrentCatalog, isLiveTransport, projectKey]);

  useEffect(() => {
    const requestKey = isLiveTransport
      ? `${projectKey}:live:${pipelineId}:${iterationId}`
      : `${projectKey}:${catalogTransport}:${catalogVersion}:${catalogRequestId}:${pipelineId}:${iterationId}`;
    if (
      !shouldRequestDetail({
        projectKey,
        hasValidRoute,
        isLiveTransport,
        catalogVersion,
        catalogProjectKey,
        pipelineCandidate,
        detailMatchesRoute,
        isLoading,
        currentIteration,
        requestKey,
        lastRequestKey: detailRequestKeyRef.current,
      })
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
    isLiveTransport,
    hasValidRoute,
    detailMatchesRoute,
    currentIteration,
    iterationId,
    pipelineCandidate,
    pipelineId,
    projectKey,
  ]);
};

interface RichIterationDetailsProps {
  richIteration: IterationRS;
  pipeline: PipelineRS;
  breadcrumbDescriptors: ComponentProps<
    typeof PageHeaderWithBreadcrumbsAndActions
  >['breadcrumbDescriptors'];
  selectedStage: AiStageKey | null;
  onSelectStage: (stage: AiStageKey) => void;
  isLoading: boolean;
  pipelineId: number;
  iterationId: number;
  organizationSlug: string;
  projectSlug: string;
}

const RichIterationDetails = ({
  richIteration,
  pipeline,
  breadcrumbDescriptors,
  selectedStage,
  onSelectStage,
  isLoading,
  pipelineId,
  iterationId,
  organizationSlug,
  projectSlug,
}: RichIterationDetailsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { canManagePipelineSettings } = useUserPermissions();
  const { openModal: openRerunModal } = useIterationRerunModal();
  const renderBanner = (richIteration: IterationRS) => {
    let content;
    switch (richIteration.status) {
      case IterationStatus.RUNNING: {
        const running = runningStage(richIteration);
        content = (
          <>
            {running
              ? formatMessage(messages.bannerRunningStage, {
                  stage: formatMessage(STAGE_LABEL_MESSAGE[running.key]),
                })
              : formatMessage(messages.bannerRunning)}
          </>
        );
        break;
      }
      case IterationStatus.COMPLETED:
        content = formatMessage(messages.bannerCompleted);
        break;
      case IterationStatus.IN_REVIEW: {
        const draftCount = draftCasesCount(richIteration);
        content = (
          <>
            {formatMessage(messages.bannerInReview, { count: draftCount })}
            {' · '}
            <Link
              className={cx('text-link')}
              to={{
                type: TEST_CASE_LIBRARY_PAGE,
                payload: { organizationSlug, projectSlug },
                query: { lifecycle: 'DRAFT', ai: 'AI', iteration: String(richIteration.id) },
              }}
            >
              {formatMessage(messages.openReviewQueue)}
            </Link>
          </>
        );
        break;
      }
      case IterationStatus.FAILED:
        content = formatMessage(messages.bannerFailedGeneric);
        break;
      default:
        return null;
    }

    const statusClass = richIteration.status.toLowerCase().replace('_', '-');
    return (
      <output className={cx('status-banner', `status-banner--${statusClass}`)} aria-live="polite">
        <IterationStatusBadge status={richIteration.status} />
        <strong className={cx('status-banner__title')}>
          {`${pipeline?.name ?? ''} / ${formatMessage(messages.iterationTitle, {
            number: richIteration.number,
          })}`}
        </strong>
        <span className={cx('status-banner__message')}>{content}</span>
      </output>
    );
  };

  const metaFields = [
    richIteration.requirement
      ? {
          key: 'requirement',
          label: formatMessage(messages.metaRequirement),
          value: `${richIteration.requirement.specId} · ${richIteration.requirement.title}`,
        }
      : undefined,
    richIteration.testCases?.length
      ? {
          key: 'testCases',
          label: formatMessage(messages.metaTestCases),
          value: richIteration.testCases.map(({ displayId }) => displayId).join(', '),
        }
      : undefined,
    {
      key: 'trigger',
      label: formatMessage(messages.metaTrigger),
      value: richIteration.trigger,
    },
    {
      key: 'startedBy',
      label: formatMessage(messages.metaStartedBy),
      value: richIteration.startedBy,
    },
    {
      key: 'model',
      label: formatMessage(messages.metaModel),
      value: richIteration.model,
    },
    {
      key: 'environment',
      label: formatMessage(messages.metaEnvironment),
      value: richIteration.environment,
    },
    {
      key: 'started',
      label: formatMessage(messages.metaStarted),
      value: startedAndDuration(richIteration),
    },
  ].filter((field): field is { key: string; label: string; value: string } => Boolean(field));

  const currentStage =
    richIteration.stages.find((stage) => stage.key === selectedStage) || richIteration.stages[0];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={`${pipeline.name} · ${formatMessage(messages.iterationTitle, {
            number: richIteration.number,
          })}`}
          titleAddon={
            <div className={cx('title-badges')}>
              <span className={cx('iteration-badge')}>
                {formatMessage(messages.iterationBadge)}
              </span>
              <IterationStatusBadge status={richIteration.status} showIcon />
            </div>
          }
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <div className={cx('header-actions')}>
              {richIteration.previousIterationId !== undefined && (
                <Button
                  variant="text"
                  data-automation-id="compareWithPreviousButton"
                  icon={<CycleArrowsIcon />}
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
              <Button
                variant="text"
                data-automation-id="rerunIterationButton"
                icon={<RerunIcon />}
                disabled={!canManagePipelineSettings || !pipeline.rerunOptions}
                title={
                  canManagePipelineSettings
                    ? undefined
                    : formatMessage(messages.rerunPermissionUnavailable)
                }
                onClick={() => openRerunModal({ pipeline, iteration: richIteration })}
              >
                {formatMessage(messages.rerun)}
              </Button>
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
          <section className={cx('summary-card')} aria-label={formatMessage(messages.summaryLabel)}>
            <div className={cx('meta')}>
              {metaFields.map((field) => (
                <span key={field.key} className={cx('meta__field')}>
                  <span className={cx('meta__label')}>{`${field.label}:`}</span>
                  <span className={cx('meta__value')}>{field.value}</span>
                </span>
              ))}
              <span className={cx('meta__field')}>
                <span
                  className={cx('meta__label')}
                >{`${formatMessage(messages.metaCiPipeline)}:`}</span>
                <a href={richIteration.ciPipeline.url} target="_blank" rel="noreferrer">
                  {richIteration.ciPipeline.id}
                </a>
              </span>
            </div>
            {richIteration.attributes.length > 0 && (
              <div className={cx('attributes')}>
                {richIteration.attributes.map((attribute) => (
                  <span key={attribute.key} className={cx('attributes__chip')}>
                    <span className={cx('attributes__key')}>{`${attribute.key}:`}</span>
                    <span className={cx('attributes__value')}>{attribute.value}</span>
                  </span>
                ))}
              </div>
            )}
            <div className={cx('kpis')}>
              {buildKpis(pipeline.type, richIteration).map((kpi) => (
                <KpiTile
                  key={kpi.key}
                  label={formatMessage(messages[kpi.key as keyof typeof messages])}
                  value={kpi.key === 'kpiCost' ? formatCost(kpi.value as number) : kpi.value}
                />
              ))}
            </div>
          </section>
          {renderBanner(richIteration)}
          <section className={cx('stage-card-section')}>
            <h2 className={cx('section-title')}>{formatMessage(messages.stagesTitle)}</h2>
            <StageCards
              stages={richIteration.stages}
              testCasesCount={richIteration.testCasesCount}
              readyCount={richIteration.readyCount}
              fixRoundsCount={richIteration.fixRoundsCount}
              autoReadyPromotedCount={richIteration.autoReadyPromotedCount}
              selectedStage={selectedStage || defaultStageKey(pipeline.type)}
              onSelect={onSelectStage}
            />
          </section>
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
  const detailFailureKind = useSelector(pipelineIterationDetailsFailureKindSelector);
  const detailProjectKey = useSelector(pipelineIterationDetailProjectKeySelector);
  const detailPipelineId = useSelector(pipelineIterationDetailPipelineIdSelector);
  const detailIterationId = useSelector(pipelineIterationDetailIterationIdSelector);
  const isCatalogLoading = useSelector(pipelinesLoadingSelector);
  const isLiveTransport = catalogTransport === 'live';
  const { hasValidRoute, detailMatchesRoute, currentIteration, isDetailPending } =
    resolveDetailRouteState({
      pipelineId,
      iterationId,
      projectKey,
      detailProjectKey,
      detailPipelineId,
      detailIterationId,
      iteration,
      isLiveTransport,
      isCatalogLoading,
      isLoading,
    });

  const { hasCurrentCatalog, pipelineCandidate, pipeline, isReducedCatalogPipeline } =
    resolvePipelineCatalog(pipelines, pipelineId, catalogVersion, catalogProjectKey, projectKey);
  const [selectedStage, setSelectedStage] = useState<AiStageKey | null>(null);
  const hasInitializedStage = useRef(false);
  useIterationDetailRequests({
    dispatch,
    projectKey,
    pipelineId,
    iterationId,
    isLiveTransport,
    hasCurrentCatalog,
    catalogTransport,
    catalogVersion,
    catalogRequestId,
    catalogProjectKey,
    pipelineCandidate,
    hasValidRoute,
    detailMatchesRoute,
    isLoading,
    currentIteration,
  });

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
    shouldPollIteration(isLiveTransport, isLoading, pipeline, currentIteration),
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

  const retryDetail = () => {
    dispatch(getPipelineIterationDetailsAction(pipelineId, iterationId));
  };

  const backToPipelines = () => {
    dispatch({ type: PROJECT_PIPELINES_PAGE, payload: { organizationSlug, projectSlug } });
  };

  if (isLiveTransport && !hasValidRoute) {
    return (
      <ReducedIterationDetails
        iteration={null}
        hasError={false}
        isUnavailable={false}
        isInvalidRoute
        breadcrumbDescriptors={breadcrumbDescriptors}
        requestedStage={typeof query.stage === 'string' ? query.stage : undefined}
        onRetry={retryDetail}
        onBack={backToPipelines}
      />
    );
  }

  if (isDetailPending && !currentIteration) {
    return (
      <SettingsLayout>
        <output className={cx('state')} aria-live="polite">
          <SpinningPreloader />
          <span>{formatMessage(messages.detailLoading)}</span>
        </output>
      </SettingsLayout>
    );
  }

  if (isLiveTransport || isReducedCatalogPipeline) {
    return (
      <ReducedIterationDetails
        iteration={isReducedDetail(currentIteration) ? currentIteration : null}
        hasError={detailMatchesRoute && hasDetailError}
        isUnavailable={detailMatchesRoute && isDetailUnavailable}
        failureKind={detailMatchesRoute ? detailFailureKind : null}
        breadcrumbDescriptors={breadcrumbDescriptors}
        requestedStage={typeof query.stage === 'string' ? query.stage : undefined}
        onRetry={retryDetail}
        onBack={backToPipelines}
      />
    );
  }

  if (!currentIteration || isReducedDetail(currentIteration) || !pipeline) {
    return null;
  }

  return (
    <RichIterationDetails
      richIteration={currentIteration}
      pipeline={pipeline}
      breadcrumbDescriptors={breadcrumbDescriptors}
      selectedStage={selectedStage}
      onSelectStage={setSelectedStage}
      isLoading={isLoading}
      pipelineId={pipelineId}
      iterationId={iterationId}
      organizationSlug={organizationSlug}
      projectSlug={projectSlug}
    />
  );
};
