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

import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { ProjectDetails } from 'pages/organization/constants';
import {
  getPipelinesAction,
  pipelinesSelector,
  pipelinesLoadingSelector,
} from 'controllers/aiFactory/pipelines';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
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
      return <p className={cx('empty')}>{formatMessage(messages.noPipelines)}</p>;
    }

    return (
      <ul className={cx('list')} data-automation-id="pipelinesList">
        {pipelines.map((pipeline) => (
          <li key={pipeline.id} className={cx('list__item')}>
            <span className={cx('list__name')}>{pipeline.name}</span>
            <span className={cx('list__meta')}>
              {formatMessage(messages.iterationsCount, { count: pipeline.iterationsCount })}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.pageTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <Button
              variant="text"
              data-automation-id="refreshPipelinesButton"
              icon={<RefreshIcon />}
              disabled={isLoading}
              onClick={() => dispatch(getPipelinesAction())}
            >
              {formatMessage(messages.refreshPage)}
            </Button>
          }
        />
        {renderContent()}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
