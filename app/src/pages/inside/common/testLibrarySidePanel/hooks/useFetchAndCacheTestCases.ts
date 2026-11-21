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

import { RefObject, useCallback } from 'react';
import { groupBy } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { TestCase } from 'types/testCase';

import { FolderTestCases, SetState } from '../testLibraryPanelContext';
import {
  fetchAllTestCasesByFolderIds,
  getFolderCacheEntry,
  getSelectableIdsForFolders,
} from '../utils';
import { TEST_CASES_FETCH_PAGE_SIZE } from '../utils/fetchAllTestCases';

export interface FetchAndCacheResult {
  selectableIds: number[];
  newCacheEntries: Map<number, FolderTestCases>;
}

interface UseFetchAndCacheTestCasesProps {
  testPlanId: number | null;
  setTestCasesMap: SetState<Map<number, FolderTestCases>>;
  // Aborted when the panel closes, so folder downloads stop with it.
  abortControllerRef?: RefObject<AbortController>;
}

export const useFetchAndCacheTestCases = ({
  testPlanId,
  setTestCasesMap,
  abortControllerRef,
}: UseFetchAndCacheTestCasesProps) => {
  const projectKey = useSelector(projectKeySelector);

  return useCallback(
    async (uncachedFolderIds: number[]): Promise<FetchAndCacheResult> => {
      if (!projectKey) {
        return { selectableIds: [], newCacheEntries: new Map() };
      }

      const shouldFetchTestPlanTestCases = testPlanId != null && !isEmpty(uncachedFolderIds);
      const signal = abortControllerRef?.current?.signal;

      const [allTestCases, testPlanTestCases] = await Promise.all([
        fetchAllTestCasesByFolderIds(
          projectKey,
          uncachedFolderIds,
          { offset: 0, limit: TEST_CASES_FETCH_PAGE_SIZE },
          signal,
        ),
        shouldFetchTestPlanTestCases
          ? fetchAllTestCasesByFolderIds(
              projectKey,
              uncachedFolderIds,
              {
                'filter.eq.testPlanId': testPlanId,
                offset: 0,
                limit: TEST_CASES_FETCH_PAGE_SIZE,
              },
              signal,
            )
          : Promise.resolve([] as TestCase[]),
      ]);

      const fetchedTestPlanIds = new Set(testPlanTestCases.map(({ id }) => id));
      const testCasesByFolder = groupBy(allTestCases, (testCase) => testCase.testFolder.id);

      const newCacheEntries = new Map<number, FolderTestCases>(
        uncachedFolderIds.map((folderId) => [
          folderId,
          getFolderCacheEntry(testCasesByFolder[folderId] ?? [], fetchedTestPlanIds),
        ]),
      );

      setTestCasesMap((prevMap) => new Map([...prevMap, ...newCacheEntries]));

      return {
        selectableIds: getSelectableIdsForFolders(uncachedFolderIds, newCacheEntries),
        newCacheEntries,
      };
    },
    [projectKey, testPlanId, setTestCasesMap, abortControllerRef],
  );
};
