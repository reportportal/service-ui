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

import { createClassnames } from 'common/utils';
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
  const folderId = useSelector(urlFolderIdSelector);
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
  const folderIdNumber = Number(folderId);
  const actionParams = useMemo(
    () => ({
      limit: testCasesPageData?.size || TestCasePageDefaultValues.limit,
      offset: TestCasePageDefaultValues.offset,
    }),
    [testCasesPageData?.size],
  );

  const currentFolder = useMemo(() => {
    return initialFolders.find(({ id }) => id === Number(folderId));
  }, [folderId, initialFolders]);

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
    if (folderId && !currentFolder) {
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
  }, [currentFolder, folderId, dispatch, setAllTestCases]);

  useEffect(() => {
    if (currentFolder && activeFolderId !== folderIdNumber) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: folderIdNumber,
          ...actionParams,
        }),
      );
    } else if (!currentFolder && folderId === '') {
      dispatch(getAllTestCasesAction(actionParams));
    }
  }, [
    currentFolder,
    folderId,
    activeFolderId,
    folderIdNumber,
    dispatch,
    testCasesPageData?.size,
    actionParams,
  ]);

  useEffect(() => {
    dispatch(
      setActiveFolderId({
        activeFolderId: folderId ? folderIdNumber : null,
      }),
    );
  }, [folderId, folderIdNumber, dispatch]);

  const handleFolderClick = (id: number) => {
    navigateToFolder({ folderId: id });
  };

  const renderCreateFolderButton = () => {
    return canCreateTestCaseFolder ? (
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
  };

  return (
    <ExpandedOptions
      activeFolder={activeFolderId}
      setAllTestCases={setAllTestCases}
      folders={folders}
      onFolderClick={handleFolderClick}
      renderCreateFolderButton={renderCreateFolderButton}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
    >
      <AllTestCasesPage
        testCases={testCases}
        testCasesPageData={testCasesPageData}
        searchValue=""
        setSearchValue={noop}
        loading={isLoadingTestCases || areFoldersLoading}
        instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      />
    </ExpandedOptions>
  );
};
