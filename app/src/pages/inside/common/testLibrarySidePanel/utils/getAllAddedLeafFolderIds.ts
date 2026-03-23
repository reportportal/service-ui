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

import { FolderTestCases } from '../testLibraryPanelContext';

export const getAllAddedLeafFolderIds = (
  folder: TransformedFolder,
  testCasesMap: Map<number, FolderTestCases>,
): number[] => {
  const childIds = folder.folders.flatMap((folder) =>
    getAllAddedLeafFolderIds(folder, testCasesMap),
  );

  if (!isEmpty(folder.folders) || folder.testsCount === 0) {
    return childIds;
  }

  const folderData = testCasesMap.get(folder.id);

  if (!folderData) {
    return childIds;
  }

  const { testCases, addedToTestPlanIds } = folderData;
  const isFullyCached = testCases.length >= folder.testsCount;
  const isAllAdded = isFullyCached && testCases.every((tc) => addedToTestPlanIds?.has(tc.id));

  return isAllAdded ? [folder.id, ...childIds] : childIds;
};
