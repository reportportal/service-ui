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
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SearchField } from 'components/fields/searchField';
import { isAiFactoryDemoResetAvailable } from 'controllers/aiFactory';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINE_COMPARISON_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { ProjectDetails } from 'pages/organization/constants';
import {
  getPipelineIterationsAction,
  getPipelinesAction,
  isReducedPipeline,
  isReducedPipelineIteration,
  pipelineCatalogTransportSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsErrorByPipelineSelector,
  pipelineIterationsLoadingByPipelineSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import { showModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { POLLING_REQUEST_STARTED, usePolling } from 'pages/inside/aiFactory/common';
import { IterationStatus, PipelineType } from 'types/aiFactory';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PipelineGroup } from './pipelineGroup';
import { matchesSearch } from './pipelinesListUtils';
import { messages } from './messages';
import styles from './pipelinesPage.scss';

const cx = createClassnames(styles);
const ITERATIONS_POLL_INTERVAL_MS = 5000;

export const PipelinesPageContent = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const pipelines = useSelector(pipelinesSelector);
  const isLoading = useSelector(pipelinesLoadingSelector);
  const iterationsByPipeline = useSelector(pipelineIterationsByPipelineSelector);
  const iterationsLoadingByPipeline =
    useSelector(pipelineIterationsLoadingByPipelineSelector) ?? {};
  const iterationsErrorByPipeline = useSelector(pipelineIterationsErrorByPipelineSelector) ?? {};
  const catalogTransport = useSelector(pipelineCatalogTransportSelector);
  const transport = catalogTransport ?? 'mock';
  const [search, setSearch] = useState('');
  const transportRef = useRef(catalogTransport);
  transportRef.current = catalogTransport;
  const isDemoResetAvailable = isAiFactoryDemoResetAvailable(catalogTransport);
  const pipelineIds = pipelines?.map((pipeline) => pipeline.id) ?? [];
  const hasRunningAutomationIteration = Boolean(
    pipelines?.some(
      (pipeline) =>
        !isReducedPipeline(pipeline) &&
        pipeline.type === PipelineType.AUTOMATION &&
        iterationsByPipeline?.[pipeline.id]?.some(
          (iteration) =>
            !isReducedPipelineIteration(iteration) && iteration.status === IterationStatus.RUNNING,
        ),
    ),
  );

  useEffect(() => {
    if (pipelines && pipelines.length > 0) {
      dispatch(getPipelineIterationsAction(pipelines.map((pipeline) => pipeline.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelines]);

  usePolling(
    () => {
      dispatch(getPipelineIterationsAction(pipelineIds));
      return POLLING_REQUEST_STARTED;
    },
    ITERATIONS_POLL_INTERVAL_MS,
    transport === 'mock' &&
      hasRunningAutomationIteration &&
      !isLoading &&
      !Object.values(iterationsLoadingByPipeline).some(Boolean) &&
      pipelineIds.length > 0,
  );

  const breadcrumbDescriptors = [
    {
      id: 'project',
      title: projectName,
      onClick: () =>
        dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } }),
    },
  ];

  const notifyResetError = () => {
    dispatch(
      showErrorNotification({
        message: formatMessage(messages.resetDemoError),
      }),
    );
  };

  const resetDemo = async () => {
    if (!isAiFactoryDemoResetAvailable(transportRef.current)) {
      notifyResetError();
      return;
    }
    try {
      const { isAiFactoryMockRuntimeInstalled, resetMockDb } = await import(
        /* webpackChunkName: "ai-factory-mocks" */ 'controllers/aiFactory/mocks'
      );
      if (
        !isAiFactoryDemoResetAvailable(transportRef.current) ||
        !isAiFactoryMockRuntimeInstalled() ||
        !resetMockDb()
      ) {
        notifyResetError();
        return;
      }
      setSearch('');
      dispatch(getPipelinesAction());
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.resetDemoSuccess),
        }),
      );
    } catch {
      notifyResetError();
    }
  };

  const openResetDemoConfirmation = () => {
    dispatch(
      showModalAction({
        id: 'confirmationModal',
        data: {
          title: formatMessage(messages.resetDemoTitle),
          message: formatMessage(messages.resetDemoConfirmation),
          confirmText: formatMessage(COMMON_LOCALE_KEYS.RESET),
          cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          dangerConfirm: true,
          onConfirm: () => void resetDemo(),
        },
      }),
    );
  };

  const renderContent = () => {
    if (isLoading && !pipelines) {
      return <SpinningPreloader />;
    }

    if (!pipelines || pipelines.length === 0) {
      return (
        <div className={cx('empty')}>
          <p>{formatMessage(messages.noPipelines)}</p>
          <p>{formatMessage(messages.noPipelinesHint)}</p>
        </div>
      );
    }

    return (
      <>
        {pipelines.map((pipeline) => {
          const iterations = iterationsByPipeline?.[pipeline.id];
          const filtered = iterations?.filter((iteration) =>
            matchesSearch(iteration, pipeline.name, search),
          );
          return (
            <PipelineGroup
              key={pipeline.id}
              pipeline={pipeline}
              iterations={filtered}
              isLoading={Boolean(iterationsLoadingByPipeline[pipeline.id])}
              hasError={Boolean(iterationsErrorByPipeline[pipeline.id])}
              isSearching={Boolean(search.trim())}
              onRetry={() => dispatch(getPipelineIterationsAction([pipeline.id]))}
            />
          );
        })}
      </>
    );
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.pageTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <div className={cx('header-actions')}>
              <Button
                variant="text"
                data-automation-id="compareIterationsButton"
                disabled={transport !== 'mock'}
                onClick={() =>
                  dispatch({
                    type: PROJECT_PIPELINE_COMPARISON_PAGE,
                    payload: { organizationSlug, projectSlug },
                  })
                }
              >
                {formatMessage(messages.compareIterations)}
              </Button>
              <SearchField
                searchValue={search}
                setSearchValue={setSearch}
                onFilterChange={setSearch}
                placeholder={formatMessage(messages.searchPlaceholder)}
              />
              {isDemoResetAvailable && (
                <Button
                  variant="text"
                  data-automation-id="resetAiFactoryDemoButton"
                  disabled={isLoading}
                  onClick={openResetDemoConfirmation}
                >
                  {formatMessage(messages.resetDemo)}
                </Button>
              )}
              <Button
                variant="text"
                data-automation-id="refreshPipelinesButton"
                icon={<RefreshIcon />}
                disabled={isLoading}
                onClick={() => dispatch(getPipelinesAction())}
              >
                {formatMessage(messages.refreshPage)}
              </Button>
            </div>
          }
        />
        <div className={cx('page-content')}>{renderContent()}</div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
