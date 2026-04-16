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

import { useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

import { useDebouncedSpinner } from 'common/hooks';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { TestCase } from 'types/testCase';

import { usePanelActions, usePanelState } from '../testLibraryPanelContext';
import { TestCasesResponse, fetchAllTestCases, isFolderFullyCached } from '../utils';

interface UseFolderTestCasesProps {
  folderId: number;
  isOpen: boolean;
  testsCount: number;
}

export const useFolderTestCases = ({ folderId, isOpen, testsCount }: UseFolderTestCasesProps) => {
  const { isOpenRef, updateFolderTestCases } = usePanelActions();
  const { testPlanId, testCasesMap, scrollElement } = usePanelState();
  const projectKey = useSelector(projectKeySelector);
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();

  const isFetchingFirstPageRef = useRef(false);
  const scrollRestoreRef = useRef<number | null>(null);

  const folderData = testCasesMap.get(folderId);
  const { isLoading: isFolderLoading = false, page = null } = folderData ?? {};
  const isFullyCached = isFolderFullyCached(folderData);
  const hasNextPage = page ? page.number < page.totalPages : false;

  useEffect(() => {
    updateFolderTestCases(folderId, { isLoading });
  }, [folderId, isLoading, updateFolderTestCases]);

  useEffect(() => {
    if (!isOpen) {
      isFetchingFirstPageRef.current = false;
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    if (scrollRestoreRef.current !== null && scrollElement) {
      scrollElement.scrollTop = scrollRestoreRef.current;
      scrollRestoreRef.current = null;
    }
  });

  const fetchTestCases = useCallback(
    async (offset: number) => {
      if (!projectKey) {
        return;
      }

      const isFirstPage = offset === 0;
      const shouldFetchTestPlanTestCases = isFirstPage && testPlanId != null;

      updateFolderTestCases(folderId, { isError: false });
      showSpinner();

      try {
        const testCasesPromise = fetch<TestCasesResponse>(
          URLS.testCases(projectKey, {
            'filter.eq.testFolderId': folderId,
            offset,
            limit: 50,
          }),
        );

        const testPlanTestCasesForFolderPromise: Promise<TestCase[] | null> = shouldFetchTestPlanTestCases
          ? fetchAllTestCases(projectKey, {
            'filter.eq.testPlanId': testPlanId,
            'filter.eq.testFolderId': folderId,
            offset: 0,
            limit: 200,
          }).catch((): null => null)
          : Promise.resolve(null);

        const [testCasesResponse, testPlanTestCases] = await Promise.all([
          testCasesPromise,
          testPlanTestCasesForFolderPromise,
        ]);

        if (!isOpenRef.current) {
          return;
        }

        if (!isFirstPage && scrollElement) {
          scrollRestoreRef.current = scrollElement.scrollTop;
        }

        const addedToTestPlanIds =
          testPlanTestCases !== null
            ? new Set<number>(testPlanTestCases.map((testCase) => testCase.id))
            : testCasesMap.get(folderId)?.addedToTestPlanIds;

        updateFolderTestCases(folderId, {
          testCases: [
            ...(testCasesMap.get(folderId)?.testCases ?? []),
            ...testCasesResponse.content,
          ],
          page: testCasesResponse.page,
          ...(isFirstPage && { addedToTestPlanIds }),
        });
      } catch {
        updateFolderTestCases(folderId, { isError: true });
      } finally {
        hideSpinner();
      }
    },
    [
      isOpenRef,
      projectKey,
      testPlanId,
      showSpinner,
      folderId,
      updateFolderTestCases,
      testCasesMap,
      hideSpinner,
      scrollElement,
    ],
  );

  const fetchNextPage = useCallback(() => {
    if (isFolderLoading || !hasNextPage || !page) {
      return;
    }

    const offset = page.number * page.size;

    void fetchTestCases(offset);
  }, [isFolderLoading, hasNextPage, page, fetchTestCases]);

  const retryFetch = useCallback(() => {
    const currentFolderData = testCasesMap.get(folderId);
    const hasExistingTestCases = (currentFolderData?.testCases.length ?? 0) > 0;

    if (hasExistingTestCases && currentFolderData?.page) {
      const offset = currentFolderData.page.number * currentFolderData.page.size;

      void fetchTestCases(offset);
    } else {
      isFetchingFirstPageRef.current = true;

      void fetchTestCases(0);
    }
  }, [testCasesMap, folderId, fetchTestCases]);

  useEffect(() => {
    if (
      !isOpen ||
      testsCount === 0 ||
      isFullyCached ||
      isFolderLoading ||
      isFetchingFirstPageRef.current
    ) {
      return;
    }

    isFetchingFirstPageRef.current = true;

    void fetchTestCases(0);
  }, [isOpen, testsCount, isFullyCached, isFolderLoading, fetchTestCases]);

  return {
    fetchNextPage,
    retryFetch,
    hasNextPage,
    isLoading,
  };
};
