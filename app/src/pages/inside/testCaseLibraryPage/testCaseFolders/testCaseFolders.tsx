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
import { Button, PlusIcon } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';

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
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { userIdSelector } from 'controllers/user';

import { ExpandedOptions } from '../../common/expandedOptions';
import { commonMessages } from '../commonMessages';
import { useCreateFolderModal } from './modals/createFolderModal';
import { AllTestCasesPage } from '../allTestCasesPage';
import { useNavigateToFolder } from '../hooks/useNavigateToFolder';
import { useMoveFolder } from './modals/moveFolderModal/useMoveFolder';
import { useDuplicateFolder } from './modals/duplicateFolderModal/useDuplicateFolder';
import { useFolderDragDrop } from './useFolderDragDrop';

import styles from './testCaseFolders.scss';

const cx = createClassnames(styles);

export const TestCaseFolders = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { openModal: openCreateFolderModal } = useCreateFolderModal();
  const { navigateToFolder, expandFoldersToLevel } = useNavigateToFolder();
  const urlFolderId = useSelector(urlFolderIdSelector);
  const { moveFolder } = useMoveFolder();
  const { duplicateFolder } = useDuplicateFolder();
  const isLoadingTestCases = useSelector(isLoadingTestCasesSelector);
  const testCases = useSelector(testCasesSelector);
  const testCasesPageData = useSelector(testCasesPageSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const initialFolders = useSelector(foldersSelector);
  const folders = useSelector(transformedFoldersSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const { query } = useSelector(locationSelector);
  const userId = useSelector(userIdSelector) as string;
  const { canManageTestCases } = useUserPermissions();

  const urlFolderIdNumber = Number(urlFolderId);
  const activeFolder = useMemo(
    () => initialFolders.find(({ id }) => id === Number(urlFolderId)),
    [urlFolderId, initialFolders],
  );
  const userSettings = getStorageItem(`${userId}_settings`) as Record<string, unknown> | undefined;
  const savedLimit = userSettings?.testCaseListPageSize as number;
  const queryParams = useMemo(
    () => ({
      limit: Number(query?.limit) || savedLimit || TestCasePageDefaultValues.limit,
      offset: Number(query?.offset) || TestCasePageDefaultValues.offset,
      testCasesSearchParams: query?.testCasesSearchParams,
    }),
    [query, savedLimit],
  );

  const navigateToAllTestCases = useCallback(() => {
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
      navigateToAllTestCases();

      dispatch(
        showNotification({
          messageId: 'redirectWarningMessage',
          type: NOTIFICATION_TYPES.WARNING,
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );
    }
  }, [activeFolder, urlFolderId, dispatch, navigateToAllTestCases]);

  useEffect(() => {
    if (urlFolderId) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: urlFolderIdNumber,
          ...queryParams,
        }),
      );

      expandFoldersToLevel(urlFolderIdNumber);
    } else if (!activeFolder && urlFolderId === '') {
      dispatch(getAllTestCasesAction(queryParams));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFolderId, queryParams.limit, queryParams.offset, queryParams.testCasesSearchParams]);

  const handleFolderClick = (id: number) => {
    navigateToFolder({ folderId: id });
  };

  const renderCreateFolderButton = () =>
    canManageTestCases ? (
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

  const { handleMoveFolder, handleDuplicateFolder } = useFolderDragDrop({
    folders: initialFolders,
    onMove: (params) => {
      moveFolder({ ...params, parentTestFolderId: params.parentFolderId }).catch(noop);
    },
    onDuplicate: (params) => {
      duplicateFolder(params).catch(noop);
    },
  });

  return (
    <ExpandedOptions
      activeFolderId={urlFolderIdNumber || null}
      folders={folders}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      setAllTestCases={navigateToAllTestCases}
      onFolderClick={handleFolderClick}
      renderCreateFolderButton={renderCreateFolderButton}
      onMoveFolder={handleMoveFolder}
      onDuplicateFolder={handleDuplicateFolder}
    >
      <AllTestCasesPage
        testCases={testCases}
        testCasesPageData={testCasesPageData}
        instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
        isLoading={isLoadingTestCases || areFoldersLoading}
      />
    </ExpandedOptions>
  );
};
