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

import { Dispatch, SetStateAction, useCallback } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { useSelector } from 'react-redux';

import { foldersSelector, TransformedFolder } from 'controllers/testCase';
import { projectKeySelector } from 'controllers/project';
import { getAllSubfolderIds } from 'common/utils/folderUtils';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';

import { FolderTestCases, NumberSet } from './testLibraryPanelContext';
import { fetchAllTestCases } from './testCaseFetchUtils';

interface UseBatchFolderSelectionProps {
  testPlanId: number | null;
  testCasesMap: Map<number, FolderTestCases>;
  setTestCasesMap: Dispatch<SetStateAction<Map<number, FolderTestCases>>>;
  setSelectedTestCasesIds: Dispatch<SetStateAction<NumberSet>>;
  setSelectedFolderIds: Dispatch<SetStateAction<NumberSet>>;
}

const getEmptyLeafFolderIds = (folder: TransformedFolder): number[] => {
  const ids: number[] = [];

  if (folder.testsCount === 0 && isEmpty(folder.folders)) {
    ids.push(folder.id);
  }

  folder.folders.forEach((subfolder) => {
    ids.push(...getEmptyLeafFolderIds(subfolder));
  });

  return ids;
};

export const useBatchFolderSelection = ({
  testPlanId,
  testCasesMap,
  setTestCasesMap,
  setSelectedTestCasesIds,
  setSelectedFolderIds,
}: UseBatchFolderSelectionProps) => {
  const flatFolders = useSelector(foldersSelector);
  const projectKey = useSelector(projectKeySelector);

  const batchSelectFolder = useCallback(
    async (folder: TransformedFolder): Promise<void> => {
      if (!projectKey) {
        return;
      }

      const subfolderIds = getAllSubfolderIds(folder.id, flatFolders);
      const folderIdsString = [folder.id, subfolderIds].join(',');

      const allTestCases = await fetchAllTestCases(projectKey, {
        'filter.in.testFolderId': folderIdsString,
        offset: 0,
        limit: 50,
      });

      const testPlanTestCases = testPlanId
        ? await fetchAllTestCases(projectKey, {
            'filter.eq.testPlanId': testPlanId,
            'filter.in.testFolderId': folderIdsString,
            offset: 0,
            limit: 200,
          }).catch(() => [] as TestCase[])
        : [];

      const testPlanTestCasesIds = new Set(testPlanTestCases.map((testCase) => testCase.id));

      const testCasesByFolder = new Map<number, TestCase[]>();
      subfolderIds.forEach((folderId) => {
        testCasesByFolder.set(folderId, []);
      });

      allTestCases.forEach((testCase) => {
        const folderId = testCase.testFolder.id;
        const folderTestCases = testCasesByFolder.get(folderId);
        if (folderTestCases) {
          folderTestCases.push(testCase);
        }
      });

      setTestCasesMap((prevMap) => {
        const updatedMap = new Map(prevMap);

        subfolderIds.forEach((folderId) => {
          const folderTestCases = testCasesByFolder.get(folderId) ?? [];
          const addedToTestPlanIds = folderTestCases
            .filter((testCase) => testPlanTestCasesIds.has(testCase.id))
            .map((testCase) => testCase.id);

          const syntheticPage: Page = {
            number: 1,
            size: folderTestCases.length,
            totalElements: folderTestCases.length,
            totalPages: 1,
          };

          updatedMap.set(folderId, {
            testCases: folderTestCases,
            page: syntheticPage,
            isLoading: false,
            addedToTestPlanIds: addedToTestPlanIds.length > 0 ? addedToTestPlanIds : undefined,
          });
        });

        return updatedMap;
      });

      const selectableTestCasesIds: number[] = [];
      subfolderIds.forEach((folderId) => {
        const folderTestCases = testCasesByFolder.get(folderId) ?? [];
        folderTestCases.forEach((testCase) => {
          if (!testPlanTestCasesIds.has(testCase.id)) {
            selectableTestCasesIds.push(testCase.id);
          }
        });
      });

      if (selectableTestCasesIds.length > 0) {
        setSelectedTestCasesIds((prev) => {
          const updated = new Set(prev);
          selectableTestCasesIds.forEach((id) => updated.add(id));
          return updated;
        });
      }

      const emptyFolderIds = getEmptyLeafFolderIds(folder);

      if (emptyFolderIds.length > 0) {
        setSelectedFolderIds((prev) => {
          const updated = new Set(prev);
          emptyFolderIds.forEach((id) => updated.add(id));
          return updated;
        });
      }
    },
    [
      projectKey,
      flatFolders,
      testPlanId,
      setTestCasesMap,
      setSelectedTestCasesIds,
      setSelectedFolderIds,
    ],
  );

  const batchDeselectFolder = useCallback(
    (folder: TransformedFolder): void => {
      const folderIds = getAllSubfolderIds(folder.id, flatFolders);

      const testCasesToDeselect: number[] = [];
      const foldersToDeselect = getEmptyLeafFolderIds(folder);

      folderIds.forEach((folderId) => {
        const folderData = testCasesMap.get(folderId);
        if (folderData) {
          const { testCases, addedToTestPlanIds = [] } = folderData;
          const addedIdsSet = new Set(addedToTestPlanIds);
          testCases.forEach((testCase) => {
            if (!addedIdsSet.has(testCase.id)) {
              testCasesToDeselect.push(testCase.id);
            }
          });
        }
      });

      if (testCasesToDeselect.length > 0) {
        setSelectedTestCasesIds((prev) => {
          const updated = new Set(prev);
          testCasesToDeselect.forEach((id) => updated.delete(id));
          return updated;
        });
      }

      if (foldersToDeselect.length > 0) {
        setSelectedFolderIds((prev) => {
          const updated = new Set(prev);
          foldersToDeselect.forEach((id) => updated.delete(id));
          return updated;
        });
      }
    },
    [flatFolders, testCasesMap, setSelectedTestCasesIds, setSelectedFolderIds],
  );

  return {
    batchSelectFolder,
    batchDeselectFolder,
  };
};
