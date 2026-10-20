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
  pipelineCatalogErrorSelector,
  pipelineCatalogPageSelector,
  pipelineCatalogSearchSelector,
  pipelineCatalogTransportSelector,
  pipelineIterationPagesSelector,
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
import { PageControls } from './pageControls/pageControls';
import { matchesPipelineName } from './pipelinesListUtils';
import { messages } from './messages';
import styles from './pipelinesPage.scss';

const cx = createClassnames(styles);
const ITERATIONS_POLL_INTERVAL_MS = 5000;
const LIVE_PAGE_SIZE = 100;
const SEARCH_DELAY_MS = 300;

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
  const catalogError = useSelector(pipelineCatalogErrorSelector);
  const catalogPage = useSelector(pipelineCatalogPageSelector);
  const catalogSearch = useSelector(pipelineCatalogSearchSelector);
  const iterationPages = useSelector(pipelineIterationPagesSelector);
  const transport = catalogTransport ?? 'live';
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState('');
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
    const timeout = window.setTimeout(() => setServerSearch(search.trim()), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (transport === 'live' && serverSearch !== catalogSearch) {
      dispatch(getPipelinesAction({ search: serverSearch, offset: 0, limit: LIVE_PAGE_SIZE }));
    }
  }, [catalogSearch, dispatch, serverSearch, transport]);

  useEffect(() => {
    if (pipelines && pipelines.length > 0) {
      const ids = pipelines
        .filter(
          (pipeline) => transport !== 'live' || matchesPipelineName(pipeline.name, catalogSearch),
        )
        .map((pipeline) => pipeline.id);
      if (transport === 'live') {
        if (ids.length) {
          dispatch(
            getPipelineIterationsAction(ids, { search: '', offset: 0, limit: LIVE_PAGE_SIZE }),
          );
        }
      } else {
        dispatch(getPipelineIterationsAction(ids));
      }
    }
  }, [catalogSearch, dispatch, pipelines, transport]);

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

  const refreshCatalog = () =>
    dispatch(
      getPipelinesAction(
        transport === 'live'
          ? {
              search: catalogSearch,
              offset: catalogPage?.offset ?? 0,
              limit: catalogPage?.size ?? LIVE_PAGE_SIZE,
            }
          : undefined,
      ),
    );

  const renderContent = () => {
    if (isLoading && !pipelines) {
      return <SpinningPreloader />;
    }

    if (catalogError && !pipelines) {
      return (
        <div className={cx('catalog-error')}>
          <span>{formatMessage(messages.pipelinesUnavailable)}</span>
          <Button variant="text" onClick={refreshCatalog}>
            {formatMessage(messages.retry)}
          </Button>
        </div>
      );
    }

    const nameSearch = transport === 'live' ? catalogSearch : search;
    const visiblePipelines = pipelines?.filter((pipeline) =>
      matchesPipelineName(pipeline.name, nameSearch),
    );

    if (!visiblePipelines || visiblePipelines.length === 0) {
      return (
        <div className={cx('empty')}>
          <p>
            {formatMessage(nameSearch.trim() ? messages.noPipelinesMatch : messages.noPipelines)}
          </p>
          {!nameSearch.trim() && <p>{formatMessage(messages.noPipelinesHint)}</p>}
        </div>
      );
    }

    return (
      <>
        {visiblePipelines.map((pipeline) => {
          const iterations = iterationsByPipeline?.[pipeline.id];
          const page = transport === 'live' ? iterationPages?.[pipeline.id] : undefined;
          return (
            <PipelineGroup
              key={pipeline.id}
              pipeline={pipeline}
              iterations={iterations}
              isLoading={Boolean(iterationsLoadingByPipeline[pipeline.id])}
              hasError={Boolean(iterationsErrorByPipeline[pipeline.id])}
              isSearching={false}
              onRetry={() =>
                dispatch(
                  transport === 'live'
                    ? getPipelineIterationsAction([pipeline.id], {
                        search: '',
                        offset: page?.offset ?? 0,
                        limit: page?.size ?? LIVE_PAGE_SIZE,
                      })
                    : getPipelineIterationsAction([pipeline.id]),
                )
              }
              page={page}
              onPageChange={(offset) =>
                dispatch(
                  getPipelineIterationsAction([pipeline.id], {
                    search: '',
                    offset,
                    limit: page?.size ?? LIVE_PAGE_SIZE,
                  }),
                )
              }
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
        />
        <div className={cx('page-content')}>
          <div className={cx('toolbar')} data-automation-id="pipelinesToolbar">
            <SearchField
              searchValue={search}
              setSearchValue={setSearch}
              onFilterChange={setSearch}
              placeholder={formatMessage(messages.searchPlaceholder)}
              className={cx('search')}
              isAlwaysActive
            />
            <div className={cx('toolbar__actions')}>
              <Button
                variant="text"
                adjustWidthOn="content"
                data-automation-id="compareIterationsButton"
                onClick={() =>
                  dispatch({
                    type: PROJECT_PIPELINE_COMPARISON_PAGE,
                    payload: { organizationSlug, projectSlug },
                  })
                }
              >
                {formatMessage(messages.compareIterations)}
              </Button>
              {isDemoResetAvailable && (
                <Button
                  variant="text"
                  adjustWidthOn="content"
                  data-automation-id="resetAiFactoryDemoButton"
                  disabled={isLoading}
                  onClick={openResetDemoConfirmation}
                >
                  {formatMessage(messages.resetDemo)}
                </Button>
              )}
              <Button
                variant="text"
                adjustWidthOn="content"
                data-automation-id="refreshPipelinesButton"
                icon={<RefreshIcon />}
                disabled={isLoading}
                onClick={refreshCatalog}
              >
                {formatMessage(messages.refreshPage)}
              </Button>
            </div>
          </div>
          {renderContent()}
          {transport === 'live' && catalogPage && (
            <PageControls
              page={catalogPage}
              isLoading={isLoading}
              onPageChange={(offset) =>
                dispatch(
                  getPipelinesAction({
                    search: catalogSearch,
                    offset,
                    limit: catalogPage.size,
                  }),
                )
              }
            />
          )}
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
