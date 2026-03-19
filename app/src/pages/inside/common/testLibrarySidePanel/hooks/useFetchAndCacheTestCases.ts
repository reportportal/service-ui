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
import { useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { TestCase } from 'types/testCase';

import { FolderTestCases, SetState } from '../testLibraryPanelContext';
import { fetchAllTestCases, getFolderCacheEntry, getSelectableIdsForFolders } from '../utils';

interface UseFetchAndCacheTestCasesProps {
  testPlanId: number | null;
  setTestCasesMap: SetState<Map<number, FolderTestCases>>;
}

export const useFetchAndCacheTestCases = ({
  testPlanId,
  setTestCasesMap,
}: UseFetchAndCacheTestCasesProps) => {
  const projectKey = useSelector(projectKeySelector);

  return useCallback(
    async (uncachedFolderIds: number[]): Promise<number[]> => {
      if (!projectKey) {
        return [];
      }

      const folderIdsString = uncachedFolderIds.join(',');

      const [allTestCases, testPlanTestCases] = await Promise.all([
        fetchAllTestCases(projectKey, {
          'filter.in.testFolderId': folderIdsString,
          offset: 0,
          limit: 50,
        }),
        testPlanId
          ? fetchAllTestCases(projectKey, {
              'filter.eq.testPlanId': testPlanId,
              'filter.in.testFolderId': folderIdsString,
              offset: 0,
              limit: 200,
            })
          : Promise.resolve([] as TestCase[]),
      ]);

      const testPlanTestCaseIds = new Set(testPlanTestCases.map(({ id }) => id));
      const testCasesByFolder = groupBy(allTestCases, (testCase) => testCase.testFolder.id);

      const newCacheEntries = new Map<number, FolderTestCases>(
        uncachedFolderIds.map((folderId) => [
          folderId,
          getFolderCacheEntry(testCasesByFolder[folderId] ?? [], testPlanTestCaseIds),
        ]),
      );

      setTestCasesMap((prevMap) => new Map([...prevMap, ...newCacheEntries]));

      return getSelectableIdsForFolders(uncachedFolderIds, newCacheEntries);
    },
    [projectKey, testPlanId, setTestCasesMap],
  );
};
