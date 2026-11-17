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

import { useMemo } from 'react';

import { TransformedFolder } from 'controllers/testCase';

import { CheckboxSelectionState, usePanelState } from '../testLibraryPanelContext';
import {
  FOLDER_DRAG_TYPE,
  TEST_CASE_DRAG_TYPE,
  DragItem,
  FolderDragItem,
  TestCaseDragItem,
} from '../constants';
import { useSelectedRootFolders } from '../hooks/useSelectedRootFolders';

export const isWithinSelectedRoots = (
  folderId: number,
  flatFoldersMap: Map<number, TransformedFolder>,
  selectedRootFolderIds: Set<number>,
): boolean => {
  const folder = flatFoldersMap.get(folderId);

  if (!folder) {
    return false;
  }

  if (selectedRootFolderIds.has(folder.id)) {
    return true;
  }

  if (!folder.parentFolderId) {
    return false;
  }

  return isWithinSelectedRoots(folder.parentFolderId, flatFoldersMap, selectedRootFolderIds);
};

export const getSelectableSubtreeTestsCount = (
  folder: TransformedFolder,
  testPlanCountByFolderId: Map<number, number>,
): number => {
  const addedCount = testPlanCountByFolderId.get(folder.id) ?? 0;
  const selectableCurrentFolderCount = Math.max(0, folder.testsCount - addedCount);

  return (
    selectableCurrentFolderCount +
    folder.folders.reduce(
      (sum, nestedFolder) =>
        sum + getSelectableSubtreeTestsCount(nestedFolder, testPlanCountByFolderId),
      0,
    )
  );
};

interface UseFolderDragPayloadParams {
  folder: TransformedFolder;
  checkboxState: CheckboxSelectionState;
}

interface FolderDragPayload {
  type: string;
  item: DragItem;
}

export const useFolderDragPayload = ({
  folder,
  checkboxState,
}: UseFolderDragPayloadParams): FolderDragPayload => {
  const { testPlanCountByFolderId, selectedTestCases } = usePanelState();
  const { flatFoldersMap, selectedRootFolders, selectedRootFolderIds } = useSelectedRootFolders();

  return useMemo<FolderDragPayload>(() => {
    const isDraggedFolderWithinSelectedRoots =
      selectedRootFolders.length > 0 &&
      isWithinSelectedRoots(folder.id, flatFoldersMap, selectedRootFolderIds);
    const draggedFolderIdSet = new Set([folder.id]);
    const hasCheckedDescendantRootFolders =
      checkboxState === CheckboxSelectionState.INDETERMINATE &&
      selectedRootFolders.some(({ id }) =>
        isWithinSelectedRoots(id, flatFoldersMap, draggedFolderIdSet),
      );
    const shouldDragSelectedFolders =
      isDraggedFolderWithinSelectedRoots || hasCheckedDescendantRootFolders;
    const shouldDragSelectedTestCases =
      checkboxState === CheckboxSelectionState.INDETERMINATE && selectedTestCases.length > 0;

    if (shouldDragSelectedTestCases) {
      const testCaseItem: TestCaseDragItem = {
        ids: selectedTestCases.map(({ id }) => id),
        testCases: selectedTestCases,
        isMulti: selectedTestCases.length > 1,
      };

      return {
        type: TEST_CASE_DRAG_TYPE,
        item: testCaseItem,
      };
    }

    const folders = shouldDragSelectedFolders ? selectedRootFolders : [folder];
    const testCasesCount = folders.reduce(
      (sum, selectedFolder) =>
        sum + getSelectableSubtreeTestsCount(selectedFolder, testPlanCountByFolderId),
      0,
    );
    const primaryFolder = folders[0] ?? folder;

    const folderItem: FolderDragItem = {
      folder: primaryFolder,
      folders,
      isMulti: folders.length > 1,
      testCasesCount,
    };

    return {
      type: FOLDER_DRAG_TYPE,
      item: folderItem,
    };
  }, [
    checkboxState,
    flatFoldersMap,
    folder,
    selectedRootFolderIds,
    selectedRootFolders,
    selectedTestCases,
    testPlanCountByFolderId,
  ]);
};
