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
import { isEmpty, isNull } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ProjectDetails } from 'pages/organization/constants';
import { EmptyTestPlans } from 'pages/inside/testPlansPage/emptyTestPlans';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  getTestPlansAction,
  testPlansSelector,
  isLoadingSelector,
  defaultQueryParams,
} from 'controllers/testPlan';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useQueryParams } from 'common/hooks';

import { useCreateTestPlanModal } from './testPlanModals';
import { TestPlansTable } from './testPlansTable';
import { PageHeaderWithBreadcrumbsAndActions } from '../common/pageHeaderWithBreadcrumbsAndActions';
import { commonMessages } from './commonMessages';

export const TestPlansPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { openModal } = useCreateTestPlanModal();
  const projectName = useSelector(projectNameSelector);
  const { canCreateTestPlan } = useUserPermissions();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const testPlans = useSelector(testPlansSelector);
  const isLoading = useSelector(isLoadingSelector);
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];
  const queryParams = useQueryParams(defaultQueryParams);

  useEffect(() => {
    if (isNull(testPlans) && !isLoading) {
      dispatch(getTestPlansAction());
    }
  }, [dispatch, testPlans, isLoading]);

  const renderContent = () => {
    if ((testPlans && !isEmpty(testPlans)) || isLoading) {
      return <TestPlansTable testPlans={testPlans} isLoading={isLoading} />;
    }

    return <EmptyTestPlans />;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(commonMessages.pageTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          {...(!isEmpty(testPlans) && {
            actions: (
              <>
                <Button
                  variant="text"
                  data-automation-id="refreshPageButton"
                  icon={<RefreshIcon />}
                  disabled={isLoading}
                  onClick={() => dispatch(getTestPlansAction(queryParams))}
                >
                  {formatMessage(commonMessages.refreshPage)}
                </Button>
                {canCreateTestPlan && (
                  <Button
                    variant="ghost"
                    data-automation-id="createTestPlanButton"
                    onClick={openModal}
                  >
                    {formatMessage(commonMessages.createMilestone)}
                  </Button>
                )}
              </>
            ),
          })}
        />
        {renderContent()}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
