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

import { useEffect, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { noop } from 'es-toolkit/compat';
import { Button, PlusIcon } from '@reportportal/ui-kit';

import { createClassnames, getStorageItem } from 'common/utils';
import {
  transformedFoldersSelector,
  areFoldersLoadingSelector,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
  isLoadingTestCasesSelector,
  testCasesSelector,
  foldersSelector,
  testCasesPageSelector,
  activeFolderIdSelector,
} from 'controllers/testCase';
import {
  locationSelector,
  TEST_CASE_LIBRARY_PAGE,
  urlFolderIdSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showNotification,
} from 'controllers/notification';
import { setActiveFolderId } from 'controllers/testCase/actionCreators';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { userIdSelector } from 'controllers/user';

import { ExpandedOptions } from '../../common/expandedOptions';
import { commonMessages } from '../commonMessages';
import { useCreateFolderModal } from './modals/createFolderModal';
import { AllTestCasesPage } from '../allTestCasesPage';
import { useNavigateToFolder } from '../hooks/useNavigateToFolder';

import styles from './testCaseFolders.scss';

const cx = createClassnames(styles);

export const TestCaseFolders = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { openModal: openCreateFolderModal } = useCreateFolderModal();
  const { navigateToFolder } = useNavigateToFolder();
  const urlFolderId = useSelector(urlFolderIdSelector);
  const activeFolderId = useSelector(activeFolderIdSelector);
  const isLoadingTestCases = useSelector(isLoadingTestCasesSelector);
  const testCases = useSelector(testCasesSelector);
  const testCasesPageData = useSelector(testCasesPageSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const initialFolders = useSelector(foldersSelector);
  const folders = useSelector(transformedFoldersSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const { canCreateTestCaseFolder } = useUserPermissions();
  const activeFolderIdNumber = Number(urlFolderId);
  const activeFolder = useMemo(
    () => initialFolders.find(({ id }) => id === Number(urlFolderId)),
    [urlFolderId, initialFolders],
  );
  const { query } = useSelector(locationSelector);
  const userId = useSelector(userIdSelector) as string;
  const userSettings = getStorageItem(`${userId}_settings`) as Record<string, unknown> | undefined;
  const savedLimit = userSettings?.testCaseListPageSize as number;
  const queryParams = {
    limit: Number(query?.limit) || savedLimit || TestCasePageDefaultValues.limit,
    offset: Number(query?.offset) || TestCasePageDefaultValues.offset,
  };
  const setAllTestCases = useCallback(() => {
    dispatch(
      setActiveFolderId({
        activeFolderId: null,
      }),
    );
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
      },
    });
  }, [dispatch, organizationSlug, projectSlug]);

  useEffect(() => {
    if (urlFolderId && !activeFolder) {
      setAllTestCases();

      dispatch(
        showNotification({
          messageId: 'redirectWarningMessage',
          type: NOTIFICATION_TYPES.WARNING,
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );
    }
  }, [activeFolder, urlFolderId, dispatch, setAllTestCases]);

  useEffect(() => {
    if (activeFolder) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: activeFolderIdNumber,
          ...queryParams,
        }),
      );
    } else if (!activeFolder && urlFolderId === '') {
      dispatch(getAllTestCasesAction(queryParams));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder, urlFolderId, activeFolderIdNumber, dispatch, query]);

  const handleFolderClick = (id: number) => {
    navigateToFolder({ folderId: id });
  };

  const renderCreateFolderButton = () =>
    canCreateTestCaseFolder ? (
      <Button
        variant="text"
        icon={<PlusIcon />}
        className={cx('sidebar-actions__create')}
        adjustWidthOn="content"
        onClick={openCreateFolderModal}
      >
        {formatMessage(commonMessages.createFolder)}
      </Button>
    ) : null;

  return (
    <ExpandedOptions
      activeFolder={activeFolderId}
      folders={folders}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      setAllTestCases={setAllTestCases}
      onFolderClick={handleFolderClick}
      renderCreateFolderButton={renderCreateFolderButton}
    >
      <AllTestCasesPage
        testCases={testCases}
        testCasesPageData={testCasesPageData}
        searchValue=""
        instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
        isLoading={isLoadingTestCases || areFoldersLoading}
        setSearchValue={noop}
      />
    </ExpandedOptions>
  );
};
