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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Dropdown, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  clearPipelineComparisonAction,
  getPipelineComparisonAction,
  getPipelineIterationsAction,
  getPipelinesAction,
  pipelineCatalogErrorSelector,
  pipelineCatalogProjectKeySelector,
  pipelineComparisonErrorSelector,
  pipelineComparisonLoadingSelector,
  pipelineComparisonSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsErrorByPipelineSelector,
  pipelineIterationsLoadingSelector,
  pipelineIterationPagesSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINES_PAGE,
  querySelector,
  updatePagePropertiesAction,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectKeySelector, projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { PageControls } from 'pages/inside/aiFactory/pipelinesPage/pageControls/pageControls';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import { ProjectDetails } from 'pages/organization/constants';

import { ComparisonResult } from './comparisonResult';
import { COMPARE_ITERATION_PAGE_SIZE } from './compareIterationHistory';
import {
  getAvailableIterationChoices,
  getClosestEarlierIteration,
  getLatestPair,
  parseQueryId,
  type IterationChoice,
} from './compareIterationsUtils';
import { usePreviousCompareIteration } from './usePreviousCompareIteration';
import { messages } from './messages';
import styles from './compareIterationsPage.scss';

const cx = createClassnames(styles);

interface IterationBrowseState {
  projectKey: string;
  pipelineId: number;
  offset: number;
  limit: number;
  selected: IterationChoice[];
}

export const CompareIterationsPageContent = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const projectKey = useSelector(projectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const query = useSelector(querySelector);
  const loadedPipelines = useSelector(pipelinesSelector);
  const catalogProjectKey = useSelector(pipelineCatalogProjectKeySelector);
  const pipelines = catalogProjectKey === projectKey ? loadedPipelines : null;
  const hasCatalogError = useSelector(pipelineCatalogErrorSelector);
  const isPipelinesLoading = useSelector(pipelinesLoadingSelector);
  const iterationsByPipeline = useSelector(pipelineIterationsByPipelineSelector);
  const isIterationsLoading = useSelector(pipelineIterationsLoadingSelector);
  const iterationsErrors = useSelector(pipelineIterationsErrorByPipelineSelector);
  const iterationPages = useSelector(pipelineIterationPagesSelector);
  const comparison = useSelector(pipelineComparisonSelector);
  const isComparisonLoading = useSelector(pipelineComparisonLoadingSelector);
  const hasComparisonError = useSelector(pipelineComparisonErrorSelector);
  const pipelineId = parseQueryId(query.pipeline);
  const baselineId = parseQueryId(query.baseline);
  const candidateId = parseQueryId(query.candidate);
  const pipeline = pipelines?.find((item) => item.id === pipelineId);
  const iterations =
    pipelineId && catalogProjectKey === projectKey ? iterationsByPipeline?.[pipelineId] : undefined;
  const iterationPage =
    pipelineId && catalogProjectKey === projectKey ? iterationPages?.[pipelineId] : undefined;
  const hasIterationsError = Boolean(
    pipelineId && catalogProjectKey === projectKey && iterationsErrors?.[pipelineId],
  );
  const [browseState, setBrowseState] = useState<IterationBrowseState>();
  const browsing =
    browseState && browseState.projectKey === projectKey && browseState.pipelineId === pipelineId
      ? browseState
      : undefined;
  const needsDefaultPair = query.baseline === undefined && query.candidate === undefined;
  const needsFirstPage = needsDefaultPair && iterationPage?.offset > 0;
  const selectedCandidate = iterations?.find(({ id }) => id === candidateId);
  const previousOnPage = selectedCandidate
    ? getClosestEarlierIteration(iterations, selectedCandidate.number)
    : null;
  const canFindEarlierInHistory =
    iterationPage &&
    (selectedCandidate
      ? iterationPage.number < iterationPage.totalPages
      : iterationPage.totalPages > 1);
  const shouldLookUpPrevious =
    query.baseline === undefined &&
    !previousOnPage &&
    canFindEarlierInHistory &&
    !isIterationsLoading &&
    !hasIterationsError;
  const previousLookup = usePreviousCompareIteration(
    projectKey,
    pipelineId,
    shouldLookUpPrevious ? candidateId : null,
  );

  useEffect(() => {
    if (
      !pipelines &&
      !isPipelinesLoading &&
      (catalogProjectKey !== projectKey || !hasCatalogError)
    ) {
      dispatch(getPipelinesAction());
    }
  }, [catalogProjectKey, dispatch, hasCatalogError, isPipelinesLoading, pipelines, projectKey]);

  useEffect(() => {
    if (!pipelines || query.pipeline !== undefined) {
      return;
    }
    const defaultPipeline =
      pipelines.find((item) => (item.iterationsCount ?? 0) >= 2) ?? pipelines[0];
    if (defaultPipeline) {
      dispatch(updatePagePropertiesAction({ pipeline: defaultPipeline.id }));
    }
  }, [dispatch, pipelines, query.pipeline]);

  useEffect(() => {
    if (
      pipelineId &&
      catalogProjectKey === projectKey &&
      (!iterations || needsFirstPage) &&
      !isIterationsLoading &&
      !hasIterationsError
    ) {
      dispatch(
        getPipelineIterationsAction([pipelineId], {
          offset: 0,
          limit: COMPARE_ITERATION_PAGE_SIZE,
        }),
      );
    }
  }, [
    catalogProjectKey,
    dispatch,
    isIterationsLoading,
    iterations,
    hasIterationsError,
    needsFirstPage,
    pipelineId,
    projectKey,
  ]);

  useEffect(() => {
    if (
      !iterations ||
      query.baseline !== undefined ||
      needsFirstPage ||
      isIterationsLoading ||
      hasIterationsError
    ) {
      return;
    }
    const earlierId = previousOnPage?.id ?? previousLookup.baselineId;
    const latestPair = needsDefaultPair ? getLatestPair(iterations) : null;
    const pair = candidateId && earlierId ? { baselineId: earlierId, candidateId } : latestPair;
    if (pair) {
      dispatch(
        updatePagePropertiesAction({
          baseline: pair.baselineId,
          ...(query.candidate === undefined ? { candidate: pair.candidateId } : {}),
        }),
      );
    }
  }, [
    candidateId,
    dispatch,
    hasIterationsError,
    isIterationsLoading,
    iterations,
    needsDefaultPair,
    needsFirstPage,
    previousLookup.baselineId,
    previousOnPage?.id,
    query.baseline,
    query.candidate,
  ]);

  const hasValidPair = Boolean(
    pipelineId && baselineId && candidateId && baselineId !== candidateId,
  );

  useEffect(() => {
    if (pipelineId && baselineId && candidateId && hasValidPair) {
      dispatch(getPipelineComparisonAction(pipelineId, candidateId, baselineId));
      return;
    }
    dispatch(clearPipelineComparisonAction());
  }, [baselineId, candidateId, dispatch, hasValidPair, pipelineId, projectKey]);

  useEffect(
    () => () => {
      dispatch(clearPipelineComparisonAction());
    },
    [dispatch],
  );

  const updateSelection = (properties: Record<string, number | null>) => {
    dispatch(updatePagePropertiesAction(properties));
  };

  const handlePipelineChange = (
    value: string | number | boolean | (string | number | boolean)[],
  ) => {
    if (!Array.isArray(value) && typeof value === 'number') {
      updateSelection({ pipeline: value, baseline: null, candidate: null });
    }
  };

  const pipelineOptions = pipelines?.map((item) => ({ value: item.id, label: item.name })) ?? [];
  const previousComparisonChoices =
    comparison?.pipelineId === pipelineId && comparison?.projectKey === projectKey
      ? [comparison.baseline, comparison.candidate]
      : [];
  const selectedIds = [baselineId, candidateId];
  const availableIterations = getAvailableIterationChoices(
    iterations ?? [],
    [...previousComparisonChoices, ...(browsing?.selected ?? [])],
    selectedIds,
  );
  const iterationOptions = availableIterations.map((item) => ({
    value: item.id,
    label: formatMessage(messages.iterationOption, { number: item.number }),
  }));
  const isIterationSelectionDisabled =
    !iterationOptions.length ||
    (iterationOptions.length < 2 && (iterationPage?.totalElements ?? 0) < 2);
  const comparisonMatchesSelection = Boolean(
    comparison?.pipelineId === pipelineId &&
    comparison?.projectKey === projectKey &&
    comparison?.baseline.id === baselineId &&
    comparison?.candidate.id === candidateId,
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
  if (pipeline) {
    breadcrumbDescriptors.push({
      id: 'pipeline',
      title: pipeline.name,
      onClick: () =>
        dispatch({ type: PROJECT_PIPELINES_PAGE, payload: { organizationSlug, projectSlug } }),
    });
  }
  breadcrumbDescriptors.push({
    id: 'comparison',
    title: formatMessage(messages.pageTitle),
    onClick: undefined,
  });

  const retryComparison = () => {
    if (pipelineId && baselineId && candidateId && hasValidPair) {
      dispatch(getPipelineComparisonAction(pipelineId, candidateId, baselineId));
    }
  };

  const loadIterationPage = (
    offset: number,
    limit = iterationPage?.size ?? COMPARE_ITERATION_PAGE_SIZE,
  ) => {
    if (!pipelineId || catalogProjectKey !== projectKey) return;
    setBrowseState({
      projectKey,
      pipelineId,
      offset,
      limit,
      selected: availableIterations.filter(({ id }) => selectedIds.includes(id)),
    });
    dispatch(getPipelineIterationsAction([pipelineId], { offset, limit }));
  };

  const retryIterationPage = () => loadIterationPage(browsing?.offset ?? 0, browsing?.limit);

  const renderIterationError = (message: typeof messages.iterationsError, retry: () => void) => (
    <SystemMessage mode="error">
      {formatMessage(message)}
      <div className={cx('error-action')}>
        <Button variant="text" onClick={retry}>
          {formatMessage(messages.retry)}
        </Button>
      </div>
    </SystemMessage>
  );

  const renderState = () => {
    if (!hasValidPair && (hasIterationsError || previousLookup.hasError)) return null;
    if (
      !hasValidPair &&
      ((isPipelinesLoading && !pipelines) ||
        (isIterationsLoading && !iterations) ||
        previousLookup.isLoading)
    ) {
      return (
        <div className={cx('state', 'state--loading')}>
          <SpinningPreloader />
          <output aria-live="polite" aria-atomic="true">
            {formatMessage(messages.loading)}
          </output>
        </div>
      );
    }
    if (!pipelines?.length && !hasValidPair) {
      return <div className={cx('state')}>{formatMessage(messages.noPipelines)}</div>;
    }
    if (!pipelineId || (!pipeline && !hasValidPair)) {
      return <div className={cx('state')}>{formatMessage(messages.invalidSelection)}</div>;
    }
    if (iterations && (iterationPage?.totalElements ?? iterations.length) < 2 && !hasValidPair) {
      return <div className={cx('state')}>{formatMessage(messages.notEnoughIterations)}</div>;
    }
    if (!hasValidPair) {
      return <div className={cx('state')}>{formatMessage(messages.invalidSelection)}</div>;
    }
    if (hasComparisonError) {
      return (
        <div className={cx('state-output')}>
          <SystemMessage mode="error">
            <output aria-live="assertive" aria-atomic="true">
              {formatMessage(messages.comparisonError)}
            </output>
            <div className={cx('error-action')}>
              <Button
                variant="text"
                data-automation-id="retryComparisonButton"
                onClick={retryComparison}
              >
                {formatMessage(messages.retry)}
              </Button>
            </div>
          </SystemMessage>
        </div>
      );
    }
    if (isComparisonLoading || !comparisonMatchesSelection) {
      return (
        <div className={cx('state', 'state--loading')}>
          <SpinningPreloader />
          <output aria-live="polite" aria-atomic="true">
            {formatMessage(messages.loading)}
          </output>
        </div>
      );
    }
    return comparison ? <ComparisonResult comparison={comparison} /> : null;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.pageTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
        />
        <div className={cx('content')}>
          <div className={cx('selectors')}>
            <Dropdown
              data-automation-id="comparisonPipelineSelect"
              label={formatMessage(messages.pipelineLabel)}
              options={pipelineOptions}
              value={pipelineId ?? ''}
              onChange={handlePipelineChange}
              disabled={!pipelines?.length}
            />
            <Dropdown
              data-automation-id="comparisonBaselineSelect"
              label={formatMessage(messages.baselineLabel)}
              options={iterationOptions}
              value={baselineId ?? ''}
              onChange={(value) =>
                !Array.isArray(value) && typeof value === 'number'
                  ? updateSelection({ baseline: value })
                  : undefined
              }
              disabled={isIterationSelectionDisabled}
            />
            <Dropdown
              data-automation-id="comparisonCandidateSelect"
              label={formatMessage(messages.candidateLabel)}
              options={iterationOptions}
              value={candidateId ?? ''}
              onChange={(value) =>
                !Array.isArray(value) && typeof value === 'number'
                  ? updateSelection({ candidate: value })
                  : undefined
              }
              disabled={isIterationSelectionDisabled}
            />
          </div>
          {iterationPage && (
            <PageControls
              page={iterationPage}
              isLoading={isIterationsLoading}
              onPageChange={loadIterationPage}
            />
          )}
          {hasIterationsError && renderIterationError(messages.iterationsError, retryIterationPage)}
          {previousLookup.hasError &&
            renderIterationError(messages.previousIterationError, previousLookup.retry)}
          {renderState()}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
