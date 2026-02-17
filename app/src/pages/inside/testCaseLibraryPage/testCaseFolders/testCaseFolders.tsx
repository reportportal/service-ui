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
import type { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';
import { TREE_DROP_POSITIONS } from '@reportportal/ui-kit/common';

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
  const { canCreateTestCaseFolder } = useUserPermissions();

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

  const handleMoveFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      const draggedFolderId = Number(draggedItem.id);
      const targetFolderId = Number(targetId);

      // Determine the parent folder based on drop position
      let parentTestFolderId: number | null | undefined;

      if (position === TREE_DROP_POSITIONS.INSIDE) {
        // Dropped inside target folder
        parentTestFolderId = targetFolderId;
      } else {
        // Dropped before/after target folder - use target folder's parent
        const targetFolder = initialFolders.find((f) => f.id === targetFolderId);

        if (!targetFolder) {
          parentTestFolderId = undefined;
        } else if ('parentFolderId' in targetFolder) {
          // Target has parentFolderId property - use it (could be null or a number)
          parentTestFolderId = targetFolder.parentFolderId;
        } else {
          // Target doesn't have parentFolderId property - it's a root level folder
          parentTestFolderId = null;
        }
      }

      // Check if this is just a reorder within the same parent (not supported by backend)
      const draggedFolder = initialFolders.find((f) => f.id === draggedFolderId);
      const draggedParentId = draggedFolder?.parentFolderId ?? null;

      if (draggedParentId === parentTestFolderId && position !== TREE_DROP_POSITIONS.INSIDE) {
        // Same parent, just reordering - backend doesn't support this
        console.warn(
          'Folder reordering within the same parent is not supported by the backend API',
        );
        return;
      }

      void moveFolder({
        folderId: draggedFolderId,
        parentTestFolderId,
      });
    },
    [moveFolder, initialFolders],
  );

  const handleDuplicateFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      const draggedFolderId = Number(draggedItem.id);
      const targetFolderId = Number(targetId);
      const draggedFolderData = initialFolders.find((f) => f.id === draggedFolderId);

      if (!draggedFolderData) return;

      // Determine the parent folder based on drop position
      let parentFolderId: number | null | undefined;

      if (position === TREE_DROP_POSITIONS.INSIDE) {
        // Dropped inside target folder
        parentFolderId = targetFolderId;
      } else {
        // Dropped before/after target folder - use target folder's parent
        const targetFolder = initialFolders.find((f) => f.id === targetFolderId);

        if (!targetFolder) {
          parentFolderId = undefined;
        } else if ('parentFolderId' in targetFolder) {
          // Target has parentFolderId property - use it (could be null or a number)
          parentFolderId = targetFolder.parentFolderId;
        } else {
          // Target doesn't have parentFolderId property - it's a root level folder
          parentFolderId = null;
        }
      }

      void duplicateFolder({
        folderId: draggedFolderId,
        folderName: `${draggedFolderData.name} (Copy)`,
        parentFolderId,
      });
    },
    [duplicateFolder, initialFolders],
  );

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
