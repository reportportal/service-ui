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

import { useCallback } from 'react';
import { groupBy } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { TestCase } from 'types/testCase';

import { FolderTestCases, SetState } from '../testLibraryPanelContext';
import { fetchAllTestCases, getFolderCacheEntry, getSelectableIdsForFolders } from '../utils';

export interface FetchAndCacheResult {
  selectableIds: number[];
  newCacheEntries: Map<number, FolderTestCases>;
}

interface UseFetchAndCacheTestCasesProps {
  testPlanId: number | null;
  testPlanIdsByFolderId: Map<number, Set<number>>;
  isTestPlanDataComplete: boolean;
  setTestCasesMap: SetState<Map<number, FolderTestCases>>;
}

export const useFetchAndCacheTestCases = ({
  testPlanId,
  testPlanIdsByFolderId,
  isTestPlanDataComplete,
  setTestCasesMap,
}: UseFetchAndCacheTestCasesProps) => {
  const projectKey = useSelector(projectKeySelector);

  return useCallback(
    async (uncachedFolderIds: number[]): Promise<FetchAndCacheResult> => {
      if (!projectKey) {
        return { selectableIds: [], newCacheEntries: new Map() };
      }

      const folderIdsString = uncachedFolderIds.join(',');

      const folderIdsWithoutTestPlanData = isTestPlanDataComplete
        ? []
        : uncachedFolderIds.filter((id) => !testPlanIdsByFolderId.has(id));
      const shouldFetchTestPlanTestCases =
        testPlanId != null && !isEmpty(folderIdsWithoutTestPlanData);
      const testPlanFolderIdsString = folderIdsWithoutTestPlanData.join(',');

      const [allTestCases, testPlanTestCases] = await Promise.all([
        fetchAllTestCases(projectKey, {
          'filter.in.testFolderId': folderIdsString,
          offset: 0,
          limit: 50,
        }),
        shouldFetchTestPlanTestCases
          ? fetchAllTestCases(projectKey, {
              'filter.eq.testPlanId': testPlanId,
              'filter.in.testFolderId': testPlanFolderIdsString,
              offset: 0,
              limit: 200,
            })
          : Promise.resolve([] as TestCase[]),
      ]);

      const fetchedTestPlanIds = new Set(testPlanTestCases.map(({ id }) => id));
      const testCasesByFolder = groupBy(allTestCases, (testCase) => testCase.testFolder.id);

      const getTestPlanIdsForFolder = (folderId: number) =>
        testPlanIdsByFolderId.get(folderId) ?? fetchedTestPlanIds;

      const newCacheEntries = new Map<number, FolderTestCases>(
        uncachedFolderIds.map((folderId) => [
          folderId,
          getFolderCacheEntry(testCasesByFolder[folderId] ?? [], getTestPlanIdsForFolder(folderId)),
        ]),
      );

      setTestCasesMap((prevMap) => new Map([...prevMap, ...newCacheEntries]));

      return {
        selectableIds: getSelectableIdsForFolders(uncachedFolderIds, newCacheEntries),
        newCacheEntries,
      };
    },
    [projectKey, testPlanId, testPlanIdsByFolderId, isTestPlanDataComplete, setTestCasesMap],
  );
};
