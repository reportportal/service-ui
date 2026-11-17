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

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { useTracking } from 'react-tracking';
import { Button } from '@reportportal/ui-kit';

import {
  ADD_TESTS_SIDEBAR_CONDITION,
  TEST_PLAN_DETAILS_VIEW_TYPE,
  TEST_PLANS_PAGE_EVENTS,
} from 'analyticsEvents/testPlansPageEvents';
import { createClassnames } from 'common/utils';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import {
  PROJECT_MILESTONES_PAGE,
  PROJECT_TEST_PLAN_DETAILS_PAGE,
  locationSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';
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
  useTestPlanFolders,
  useTestPlanTestCasesLoading,
  useTestPlanSelector,
} from 'hooks/useTypedSelector';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { testPlanTestCasesSelector } from 'controllers/testPlan';
import {
  areFoldersFetchedSelector,
  areFoldersLoadingSelector,
  getFoldersAction,
  isLoadingFilteredFoldersSelector,
} from 'controllers/testCase';
import { SearchField } from 'components/fields/searchField';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { messages as testCaseListMessages } from 'pages/inside/common/testCaseList/messages';

import { TestLibrarySidePanel } from '../../common/testLibrarySidePanel';
import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PageLoader } from '../pageLoader';
import { EmptyTestPlan } from './emptyTestPlan';
import { TestPlanActions } from '../testPlanActions';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';
import {
  useEditTestPlanModal,
  useDuplicateTestPlanModal,
  useDeleteTestPlanModal,
  useCreateLaunchModal,
} from '../testPlanModals';
import { useAddTestCasesToCurrentTestPlan } from '../testPlanModals';
import { TestPlanFolders } from './testPlanFolders';
import { KEBAB_START_EVENT_MAP } from './constants';

import styles from './testPlanDetailsPage.scss';

const cx = createClassnames(styles);

export const TestPlanDetailsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { canManageTestCases, canCreateManualLaunch } = useUserPermissions();
  const [isTestLibrarySidePanelOpen, setIsTestLibrarySidePanelOpen] = useState(false);

  const testPlanId = useTestPlanId();
  const testPlan = useTestPlanById(testPlanId);
  const isLoading = useActiveTestPlanLoading();
  const isTestPlanTestCasesLoading = useTestPlanTestCasesLoading();
  const testPlanFolders = useTestPlanFolders();
  const testCases = useTestPlanSelector(testPlanTestCasesSelector);

  const location = useSelector(locationSelector);
  const isAuthorized = useSelector(isAuthorizedSelector);
  const isLoadingFilteredFolders = useSelector(isLoadingFilteredFoldersSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const areFoldersFetched = useSelector(areFoldersFetchedSelector);

  useEffect(() => {
    if (!areFoldersFetched) {
      dispatch(getFoldersAction());
    }
  }, [areFoldersFetched, dispatch]);
  const [searchValue, setSearchValue] = useState(location?.query?.testCasesSearchParams || '');
  const searchDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchDebounceTimeoutRef.current != null) {
      clearTimeout(searchDebounceTimeoutRef.current);
      searchDebounceTimeoutRef.current = null;
    }

    const querySearch = location?.query?.testCasesSearchParams || '';
    const frameId = requestAnimationFrame(() => {
      setSearchValue(querySearch);
    });

    return () => cancelAnimationFrame(frameId);
  }, [location?.query?.testCasesSearchParams]);

  const isSearchLoading =
    searchValue !== (location?.query?.testCasesSearchParams || '') ||
    isTestPlanTestCasesLoading ||
    isLoadingFilteredFolders;

  useEffect(
    () => () => {
      if (searchDebounceTimeoutRef.current != null) {
        clearTimeout(searchDebounceTimeoutRef.current);
        searchDebounceTimeoutRef.current = null;
      }
    },
    [],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      if (searchDebounceTimeoutRef.current != null) {
        clearTimeout(searchDebounceTimeoutRef.current);
      }
      searchDebounceTimeoutRef.current = setTimeout(() => {
        searchDebounceTimeoutRef.current = null;
        if (value) {
          trackEvent(TEST_PLANS_PAGE_EVENTS.SEARCH_TEST_PLANS);
        }
        dispatch(
          updatePagePropertiesAction({
            testCasesSearchParams: value,
            ...TestCasePageDefaultValues,
          }),
        );
      }, SEARCH_DELAY);
    },
    [dispatch, trackEvent],
  );

  const { openModal: openEditModal } = useEditTestPlanModal({
    onSubmitSuccess: ({ attributesCount, editedFieldsCondition }) =>
      trackEvent(
        TEST_PLANS_PAGE_EVENTS.submitEditTestPlan({
          number: attributesCount,
          condition: editedFieldsCondition,
        }),
      ),
  });
  const { openModal: openDuplicateModal } = useDuplicateTestPlanModal({
    onSuccess: (newTestPlanId) => {
      trackEvent(TEST_PLANS_PAGE_EVENTS.SUBMIT_DUPLICATE_TEST_PLAN);
      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, testPlanId: newTestPlanId },
      });
    },
  });
  const { openModal: openDeleteModal } = useDeleteTestPlanModal({
    onSuccess: () => {
      trackEvent(TEST_PLANS_PAGE_EVENTS.SUBMIT_DELETE_TEST_PLAN);
      dispatch({
        type: PROJECT_MILESTONES_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    },
  });

  const { openModal: openCreateLaunchModal } = useCreateLaunchModal(testCases || []);

  const handleOpenCreateLaunchModal = () => {
    trackEvent(TEST_PLANS_PAGE_EVENTS.CLICK_START_CREATE_LAUNCH_FROM_PLAN);
    openCreateLaunchModal();
  };

  const handleOpenTestLibrarySidePanel = () => {
    trackEvent(
      TEST_PLANS_PAGE_EVENTS.clickOpenAddTestsSidebar(ADD_TESTS_SIDEBAR_CONDITION.ADD_TESTS_BUTTON),
    );
    setIsTestLibrarySidePanelOpen(true);
  };

  const actionsMap = {
    edit: openEditModal,
    duplicate: openDuplicateModal,
    delete: openDeleteModal,
  };

  const openActionModal = (action: keyof typeof actionsMap) => () => {
    if (testPlan) {
      trackEvent(KEBAB_START_EVENT_MAP[action]);
      actionsMap[action](testPlan);
    }
  };

  const { addTestCasesToCurrentTestPlan, isAddingTestCases } = useAddTestCasesToCurrentTestPlan();

  const lastTrackedTestPlanIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (isLoading || areFoldersLoading || !testPlan || testPlanId == null) {
      return;
    }
    if (lastTrackedTestPlanIdRef.current === testPlanId) {
      return;
    }
    lastTrackedTestPlanIdRef.current = testPlanId;

    const isEmptyPlan = !testPlan.executionStatistic.total && isEmpty(testPlanFolders);

    trackEvent(
      TEST_PLANS_PAGE_EVENTS.viewTestPlanDetailsPage(
        isEmptyPlan ? TEST_PLAN_DETAILS_VIEW_TYPE.EMPTY : TEST_PLAN_DETAILS_VIEW_TYPE.POPULATED,
      ),
    );
  }, [isLoading, areFoldersLoading, testPlan, testPlanFolders, testPlanId, trackEvent]);

  useEffect(() => {
    if (!isLoading && isEmpty(testPlan) && isAuthorized) {
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: formatMessage(messages.testPlanNotFoundRedirect),
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );

      dispatch({
        type: PROJECT_MILESTONES_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    }
  }, [isLoading, testPlan, isAuthorized, dispatch, organizationSlug, projectSlug, formatMessage]);

  const breadcrumbDescriptors = [
    {
      id: 'milestones',
      title: formatMessage(commonMessages.pageTitle),
      link: {
        type: PROJECT_MILESTONES_PAGE,
        payload: { organizationSlug, projectSlug },
      },
    },
    { id: 'testPlan', title: testPlan?.name },
  ];

  const renderActions = () => (
    <>
      <div className={cx('test-plan-details-page__actions-toolbar')}>
        <div className={cx('test-plan-details-page__header-id')}>
          <span>{formatMessage(messages.testPlanIdLabel)}</span>
          {testPlan ? <span>{testPlan.displayId}</span> : null}
        </div>
        <SearchField
          isLoading={isSearchLoading}
          searchValue={searchValue}
          placeholder={formatMessage(testCaseListMessages.searchPlaceholder)}
          setSearchValue={setSearchValue}
          onFilterChange={handleFilterChange}
          className={cx('test-plan-details-page__search')}
        />
        <TestPlanActions
          testPlanId={testPlanId}
          variant="header"
          onEdit={openActionModal('edit')}
          onDuplicate={openActionModal('duplicate')}
          onDelete={openActionModal('delete')}
        />
      </div>
      {!isEmpty(testPlanFolders) && (
        <>
          {canManageTestCases && (
            <Button
              variant="ghost"
              data-automation-id="addTestsFromLibraryButton"
              onClick={handleOpenTestLibrarySidePanel}
            >
              {formatMessage(commonMessages.addTestsFromLibrary)}
            </Button>
          )}
          {canCreateManualLaunch && (
            <Button
              variant="primary"
              data-automation-id="createLaunchButton"
              onClick={handleOpenCreateLaunchModal}
            >
              {formatMessage(messages.addToLaunch)}
            </Button>
          )}
        </>
      )}
    </>
  );

  if (isLoading || areFoldersLoading) {
    return (
      <SettingsLayout>
        <PageLoader />
      </SettingsLayout>
    );
  }

  const renderContent = () => {
    if (!testPlan?.executionStatistic.total && isEmpty(testPlanFolders)) {
      return <EmptyTestPlan onOpenTestLibrary={() => setIsTestLibrarySidePanelOpen(true)} />;
    }

    return <TestPlanFolders isLoading={isTestPlanTestCasesLoading} />;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-plan-details-page')}>
          <PageHeaderWithBreadcrumbsAndActions
            title={testPlan?.name || ''}
            breadcrumbDescriptors={breadcrumbDescriptors}
            actions={renderActions()}
            actionsClassName={cx('test-plan-details-page__header-actions')}
          />
          <div className={cx('test-plan-details-page__content')}>{renderContent()}</div>
        </div>
      </ScrollWrapper>
      {isTestLibrarySidePanelOpen && (
        <TestLibrarySidePanel
          isOpen
          onAddTestCases={addTestCasesToCurrentTestPlan}
          onClose={() => setIsTestLibrarySidePanelOpen(false)}
          isAddingToTestPlan={isAddingTestCases}
        />
      )}
    </SettingsLayout>
  );
};
