/*
 * Copyright 2025 EPAM Systems
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

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ProjectDetails } from 'pages/organization/constants';
import { EmptyTestPlans } from 'pages/inside/testPlansPage/emptyTestPlans';
import { BreadcrumbsTreeIcon, Button, RefreshIcon } from '@reportportal/ui-kit';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { projectNameSelector } from 'controllers/project';
import {
  PROJECT_DASHBOARD_PAGE,
  urlOrganizationAndProjectSelector,
  userRolesSelector,
} from 'controllers/pages';
import { useTestPlans } from 'pages/inside/testPlansPage/testPlansTable/useTestPlans';
import { useCreateTestPlanModal } from './hooks';
import { TestPlansTable } from './testPlansTable';
import { commonMessages } from './commonMessages';

import styles from './testPlansPage.scss';
import { canCreateTestPlan } from 'common/utils/permissions';

const cx = classNames.bind(styles) as typeof classNames;

export const TestPlansPage = () => {
  const { formatMessage } = useIntl();
  const { openModal } = useCreateTestPlanModal();
  const projectName = useSelector(projectNameSelector);
  const userRoles = useSelector(userRolesSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const { testPlans } = useTestPlans();
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <header className={cx('test-plans-page__header')}>
          <div className={cx('test-plans-page__breadcrumb')}>
            <BreadcrumbsTreeIcon />
            <Breadcrumbs descriptors={breadcrumbDescriptors} />
          </div>
          <h1>{formatMessage(commonMessages.pageTitle)}</h1>
          {!isEmpty(testPlans) && (
            <div className={cx('test-plans-page__actions')}>
              <Button variant="text" data-automation-id="refreshPageButton" icon={<RefreshIcon />}>
                {formatMessage(commonMessages.refreshPage)}
              </Button>
              {canCreateTestPlan(userRoles) && (
                <Button
                  variant="ghost"
                  data-automation-id="createTestPlanButton"
                  onClick={openModal}
                >
                  {formatMessage(commonMessages.createTestPlan)}
                </Button>
              )}
            </div>
          )}
        </header>
        {isEmpty(testPlans) ? <EmptyTestPlans /> : <TestPlansTable testPlans={testPlans} />}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
