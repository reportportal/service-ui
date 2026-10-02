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
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SearchField } from 'components/fields/searchField';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { ProjectDetails } from 'pages/organization/constants';
import {
  getPipelineIterationsAction,
  getPipelinesAction,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsLoadingSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PipelineGroup } from './pipelineGroup';
import { matchesSearch } from './pipelinesListUtils';
import { messages } from './messages';
import styles from './pipelinesPage.scss';

const cx = createClassnames(styles);

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
  const iterationsLoading = useSelector(pipelineIterationsLoadingSelector);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (pipelines && pipelines.length > 0) {
      dispatch(getPipelineIterationsAction(pipelines.map((pipeline) => pipeline.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelines]);

  const breadcrumbDescriptors = [
    {
      id: 'project',
      title: projectName,
      onClick: () =>
        dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } }),
    },
  ];

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
              isLoading={iterationsLoading}
              isSearching={Boolean(search.trim())}
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
              <SearchField
                searchValue={search}
                setSearchValue={setSearch}
                onFilterChange={setSearch}
                placeholder={formatMessage(messages.searchPlaceholder)}
              />
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
