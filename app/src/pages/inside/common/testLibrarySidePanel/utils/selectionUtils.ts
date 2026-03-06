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

import { isEmpty } from 'es-toolkit/compat';

import { TransformedFolder } from 'controllers/testCase';

import { NumberSet, FolderTestCases, CheckboxSelectionState } from '../testLibraryPanelContext';

interface SubtreeSelectionCounts {
  totalSelectable: number;
  totalSelected: number;
  emptyFolderCount: number;
  selectedEmptyFolderCount: number;
}

const getCheckboxState = ({
  totalSelectable,
  emptyFolderCount,
  totalSelected,
  selectedEmptyFolderCount,
}: SubtreeSelectionCounts) => {
  if (totalSelectable === 0 && emptyFolderCount === 0) {
    return CheckboxSelectionState.UNCHECKED;
  }

  const isAllSelected =
    (totalSelectable === 0 || totalSelected === totalSelectable) &&
    (emptyFolderCount === 0 || selectedEmptyFolderCount === emptyFolderCount);

  if (isAllSelected) {
    return CheckboxSelectionState.CHECKED;
  }

  if (totalSelected === 0 && selectedEmptyFolderCount === 0) {
    return CheckboxSelectionState.UNCHECKED;
  }

  return CheckboxSelectionState.INDETERMINATE;
};

const getFolderSelectionCounts = (
  folder: TransformedFolder,
  selectedIds: NumberSet,
  selectedFolderIds: NumberSet,
  testCasesMap: Map<number, FolderTestCases>,
): SubtreeSelectionCounts => {
  const folderData = testCasesMap.get(folder.id);
  const addedIds = folderData?.addedToTestPlanIds;
  const testCases = folderData?.testCases ?? [];
  const selectableTestCases = testCases.filter(({ id }) => !addedIds?.has(id));
  const uncachedCount = Math.max(0, folder.testsCount - testCases.length);
  const isEmptyFolderLeaf = folder.testsCount === 0 && isEmpty(folder.folders);

  return {
    totalSelectable: selectableTestCases.length + uncachedCount,
    totalSelected: selectableTestCases.filter((testCase) => selectedIds.has(testCase.id)).length,
    emptyFolderCount: isEmptyFolderLeaf ? 1 : 0,
    selectedEmptyFolderCount: isEmptyFolderLeaf && selectedFolderIds.has(folder.id) ? 1 : 0,
  };
};

export const getAllCheckboxStates = (
  folders: TransformedFolder[],
  selectedIds: NumberSet,
  selectedFolderIds: NumberSet,
  testCasesMap: Map<number, FolderTestCases>,
): Map<number, CheckboxSelectionState> => {
  const statesMap = new Map<number, CheckboxSelectionState>();

  const getFolderCheckboxesState = (folder: TransformedFolder): SubtreeSelectionCounts => {
    const folderSelectionCounts = getFolderSelectionCounts(
      folder,
      selectedIds,
      selectedFolderIds,
      testCasesMap,
    );

    const totals = folder.folders.reduce((acc, subfolder) => {
      const subfolderCounts = getFolderCheckboxesState(subfolder);

      return {
        totalSelectable: acc.totalSelectable + subfolderCounts.totalSelectable,
        totalSelected: acc.totalSelected + subfolderCounts.totalSelected,
        emptyFolderCount: acc.emptyFolderCount + subfolderCounts.emptyFolderCount,
        selectedEmptyFolderCount:
          acc.selectedEmptyFolderCount + subfolderCounts.selectedEmptyFolderCount,
      };
    }, folderSelectionCounts);

    statesMap.set(folder.id, getCheckboxState(totals));

    return totals;
  };

  folders.forEach(getFolderCheckboxesState);

  return statesMap;
};
