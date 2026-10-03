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

import { useEffect } from 'react';
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
  pipelineComparisonErrorSelector,
  pipelineComparisonLoadingSelector,
  pipelineComparisonSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsLoadingSelector,
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
import { projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import { ProjectDetails } from 'pages/organization/constants';

import { ComparisonResult } from './comparisonResult';
import { getLatestPair, parseQueryId } from './compareIterationsUtils';
import { messages } from './messages';
import styles from './compareIterationsPage.scss';

const cx = createClassnames(styles);

export const CompareIterationsPageContent = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const query = useSelector(querySelector);
  const pipelines = useSelector(pipelinesSelector);
  const isPipelinesLoading = useSelector(pipelinesLoadingSelector);
  const iterationsByPipeline = useSelector(pipelineIterationsByPipelineSelector);
  const isIterationsLoading = useSelector(pipelineIterationsLoadingSelector);
  const comparison = useSelector(pipelineComparisonSelector);
  const isComparisonLoading = useSelector(pipelineComparisonLoadingSelector);
  const hasComparisonError = useSelector(pipelineComparisonErrorSelector);
  const pipelineId = parseQueryId(query.pipeline);
  const baselineId = parseQueryId(query.baseline);
  const candidateId = parseQueryId(query.candidate);
  const pipeline = pipelines?.find((item) => item.id === pipelineId);
  const iterations = pipelineId ? iterationsByPipeline?.[pipelineId] : undefined;

  useEffect(() => {
    if (!pipelines || query.pipeline !== undefined) {
      return;
    }
    const defaultPipeline = pipelines.find((item) => item.iterationsCount >= 2) ?? pipelines[0];
    if (defaultPipeline) {
      dispatch(updatePagePropertiesAction({ pipeline: defaultPipeline.id }));
    }
  }, [dispatch, pipelines, query.pipeline]);

  useEffect(() => {
    if (pipelineId && pipeline && !iterations) {
      dispatch(getPipelineIterationsAction([pipelineId]));
    }
  }, [dispatch, iterations, pipeline, pipelineId]);

  useEffect(() => {
    if (!iterations || query.baseline !== undefined || query.candidate !== undefined) {
      return;
    }
    const pair = getLatestPair(iterations);
    if (pair) {
      dispatch(
        updatePagePropertiesAction({
          baseline: pair.baselineId,
          candidate: pair.candidateId,
        }),
      );
    }
  }, [dispatch, iterations, query.baseline, query.candidate]);

  const hasValidPair = Boolean(
    pipeline &&
    iterations &&
    baselineId &&
    candidateId &&
    baselineId !== candidateId &&
    iterations.some((item) => item.id === baselineId) &&
    iterations.some((item) => item.id === candidateId),
  );

  useEffect(() => {
    if (pipelineId && baselineId && candidateId && hasValidPair) {
      dispatch(getPipelineComparisonAction(pipelineId, candidateId, baselineId));
      return;
    }
    dispatch(clearPipelineComparisonAction());
  }, [baselineId, candidateId, dispatch, hasValidPair, pipelineId]);

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
  const iterationOptions =
    iterations?.map((item) => ({
      value: item.id,
      label: formatMessage(messages.iterationOption, { number: item.number }),
    })) ?? [];
  const comparisonMatchesSelection = Boolean(
    comparison &&
    comparison.pipelineId === pipelineId &&
    comparison.baseline.id === baselineId &&
    comparison.candidate.id === candidateId,
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

  const retryComparison = () => {
    if (pipelineId && baselineId && candidateId && hasValidPair) {
      dispatch(getPipelineComparisonAction(pipelineId, candidateId, baselineId));
    }
  };

  const renderState = () => {
    if ((isPipelinesLoading && !pipelines) || (isIterationsLoading && !iterations)) {
      return (
        <div className={cx('state', 'state--loading')} role="status" aria-live="polite">
          <SpinningPreloader />
          <span>{formatMessage(messages.loading)}</span>
        </div>
      );
    }
    if (!pipelines?.length) {
      return (
        <div className={cx('state')} role="status">
          {formatMessage(messages.noPipelines)}
        </div>
      );
    }
    if (!pipelineId || !pipeline) {
      return (
        <div className={cx('state')} role="status">
          {formatMessage(messages.invalidSelection)}
        </div>
      );
    }
    if (!iterations || iterations.length < 2) {
      return (
        <div className={cx('state')} role="status">
          {formatMessage(messages.notEnoughIterations)}
        </div>
      );
    }
    if (!hasValidPair) {
      return (
        <div className={cx('state')} role="status">
          {formatMessage(messages.invalidSelection)}
        </div>
      );
    }
    if (hasComparisonError) {
      return (
        <div role="status" aria-live="assertive" aria-atomic="true">
          <SystemMessage mode="error">
            {formatMessage(messages.comparisonError)}
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
        <div className={cx('state', 'state--loading')} role="status" aria-live="polite">
          <SpinningPreloader />
          <span>{formatMessage(messages.loading)}</span>
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
              disabled={iterationOptions.length < 2}
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
              disabled={iterationOptions.length < 2}
            />
          </div>
          {renderState()}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
