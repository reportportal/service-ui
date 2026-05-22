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
import { isEmpty } from 'es-toolkit/compat';

import { TestCase } from 'types/testCase';

import { usePanelState } from '../testLibraryPanelContext';
import { FOLDER_DRAG_TYPE, TEST_CASE_DRAG_TYPE, DragItem, TestCaseDragItem } from '../constants';
import {
  isWithinSelectedRoots,
  getSelectableSubtreeTestsCount,
} from '../selectableFolderTree/useFolderDragPayload';
import { useSelectedRootFolders } from '../hooks/useSelectedRootFolders';

interface UseTestCaseDragPayloadParams {
  testCase: TestCase;
  isSelected: boolean;
  selectedTestCases: TestCase[];
  folderId: number;
}

interface TestCaseDragPayload {
  type: string;
  item: DragItem;
}

export const useTestCaseDragPayload = ({
  testCase,
  isSelected,
  selectedTestCases,
  folderId,
}: UseTestCaseDragPayloadParams): TestCaseDragPayload => {
  const { testPlanCountByFolderId } = usePanelState();
  const { flatFoldersMap, selectedRootFolders, selectedRootFolderIds } = useSelectedRootFolders();

  return useMemo<TestCaseDragPayload>(() => {
    const isFolderWithinSelectedRoots =
      !isEmpty(selectedRootFolders) &&
      isWithinSelectedRoots(folderId, flatFoldersMap, selectedRootFolderIds);

    if (isFolderWithinSelectedRoots) {
      const testCasesCount = selectedRootFolders.reduce(
        (sum, folder) => sum + getSelectableSubtreeTestsCount(folder, testPlanCountByFolderId),
        0,
      );
      const primaryFolder = selectedRootFolders[0];

      return {
        type: FOLDER_DRAG_TYPE,
        item: {
          folder: primaryFolder,
          folders: selectedRootFolders,
          isMulti: selectedRootFolders.length > 1,
          testCasesCount,
        },
      };
    }

    const shouldDragSelection = isSelected && selectedTestCases.length > 1;
    const items = shouldDragSelection ? selectedTestCases : [testCase];

    const testCaseItem: TestCaseDragItem = {
      ids: items.map(({ id }) => id),
      testCases: items,
      isMulti: items.length > 1,
    };

    return {
      type: TEST_CASE_DRAG_TYPE,
      item: testCaseItem,
    };
  }, [
    flatFoldersMap,
    folderId,
    isSelected,
    selectedRootFolderIds,
    selectedRootFolders,
    selectedTestCases,
    testCase,
    testPlanCountByFolderId,
  ]);
};
