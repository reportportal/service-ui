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

import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { isEmpty } from 'es-toolkit/compat';
import { Button } from '@reportportal/ui-kit';

import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { PROJECT_TEST_PLANS_PAGE, PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import {
  showNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
} from 'controllers/notification';
import {
  useProjectDetails,
  useTestPlanId,
  useActiveTestPlanLoading,
  useTestPlanById,
} from 'hooks/useTypedSelector';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { TestPlansHeader } from '../testPlansHeader';
import { PageLoader } from '../pageLoader';
import { EmptyTestPlan } from './emptyTestPlan';
import { TestPlanActions } from '../testPlanActions';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';
import {
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
  useDeleteTestPlanModal,
} from '../testPlanModals';

import styles from './testPlanDetailsPage.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const TestPlanDetailsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { canAddTestCaseToTestPlan, canCreateManualLaunch } = useUserPermissions();
  const testPlanId = useTestPlanId();
  const testPlan = useTestPlanById(testPlanId);
  const isLoading = useActiveTestPlanLoading();
  const { openModal: openEditModal } = useEditTestPlanModal();
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal({
    onSuccess: (newTestPlanId) =>
      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, testPlanId: newTestPlanId },
      }),
  });
  const { openModal: openDeleteModal } = useDeleteTestPlanModal({
    onSuccess: () =>
      dispatch({
        type: PROJECT_TEST_PLANS_PAGE,
        payload: { organizationSlug, projectSlug },
      }),
  });

  const actionsMap = {
    edit: openEditModal,
    duplicate: openDuplicateModal,
    delete: openDeleteModal,
  };

  const openActionModal = (action: keyof typeof actionsMap) => () => {
    if (testPlan) {
      actionsMap[action](testPlan);
    }
  };

  useEffect(() => {
    if (!isLoading && isEmpty(testPlan)) {
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: formatMessage(messages.testPlanNotFoundRedirect),
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );

      dispatch({
        type: PROJECT_TEST_PLANS_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    }
  }, [isLoading, testPlan, dispatch, organizationSlug, projectSlug, formatMessage]);

  const breadcrumbDescriptors = [
    {
      id: 'testPlans',
      title: formatMessage(commonMessages.pageTitle),
      link: {
        type: PROJECT_TEST_PLANS_PAGE,
        payload: { organizationSlug, projectSlug },
      },
    },
    { id: 'testPlan', title: testPlan?.name },
  ];

  const renderActions = () => (
    <>
      <div className={cx('test-plan-details-page__header-id')}>
        {formatMessage(messages.testPlanId, { testPlanId })}
      </div>
      <TestPlanActions
        testPlanId={testPlanId}
        variant="header"
        onEdit={openActionModal('edit')}
        onDuplicate={openActionModal('duplicate')}
        onDelete={openActionModal('delete')}
      />
      {!isEmpty(testPlan?.totalTestCases) && (
        <>
          {canAddTestCaseToTestPlan && (
            <Button variant="ghost" data-automation-id="addTestsFromLibraryButton">
              {formatMessage(commonMessages.addTestsFromLibrary)}
            </Button>
          )}
          {canCreateManualLaunch && (
            <Button variant="primary" data-automation-id="createLaunchButton">
              {formatMessage(messages.createLaunch)}
            </Button>
          )}
        </>
      )}
    </>
  );

  if (isLoading) {
    return (
      <SettingsLayout>
        <PageLoader />
      </SettingsLayout>
    );
  }

  const renderContent = () => {
    if (!testPlan?.totalTestCases) {
      return <EmptyTestPlan />;
    }

    return <div>Test cases are present</div>;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <TestPlansHeader
          title={testPlan?.name || ''}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={renderActions()}
        />
        {renderContent()}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
