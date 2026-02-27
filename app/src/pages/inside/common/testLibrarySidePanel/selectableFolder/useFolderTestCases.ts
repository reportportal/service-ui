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

import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { useDebouncedSpinner } from 'common/hooks';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';

import { useTestLibraryPanelContext } from '../testLibraryPanelContext';

interface UseFolderTestCasesProps {
  folderId: number;
  isOpen: boolean;
  testsCount: number;
}

interface TestCasesResponse {
  content: TestCase[];
  page: Page;
}

export const useFolderTestCases = ({ folderId, isOpen, testsCount }: UseFolderTestCasesProps) => {
  const { testPlanId, testCasesMap, updateFolderTestCases } = useTestLibraryPanelContext();
  const projectKey = useSelector(projectKeySelector);
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();

  const {
    testCases = [],
    isLoading: isFolderLoading = false,
    page = null,
  } = testCasesMap.get(folderId) ?? {};

  const hasFetched = page != null;
  const hasNextPage = page ? page.number < page.totalPages - 1 : false;

  useEffect(() => {
    updateFolderTestCases(folderId, { isLoading });
  }, [folderId, isLoading, updateFolderTestCases]);

  const fetchTestCases = useCallback(
    async (offset: number) => {
      if (!projectKey) {
        return;
      }

      const isFirstPage = offset === 0;
      const shouldFetchTestPlanTestCases = isFirstPage && testPlanId;

      showSpinner();

      try {
        const testCasesPromise = fetch<TestCasesResponse>(
          URLS.testCases(projectKey, {
            'filter.eq.testFolderId': folderId,
            offset,
            limit: 50,
          }),
        );

        const testPlanTestCasesForFolderPromise = shouldFetchTestPlanTestCases
          ? fetch<TestCasesResponse>(
              URLS.testCases(projectKey, {
                'filter.eq.testPlanId': testPlanId,
                'filter.eq.testFolderId': folderId,
                offset: 0,
                limit: 9999,
              }),
            ).catch(() => ({ content: [] as TestCase[] }))
          : Promise.resolve({ content: [] as TestCase[] });

        const [testCasesResponse, testPlanTestCasesResponse] = await Promise.all([
          testCasesPromise,
          testPlanTestCasesForFolderPromise,
        ]);

        const testCasesAddedToTestPlanIds = testPlanTestCasesResponse.content.map(({ id }) => id);

        updateFolderTestCases(folderId, {
          testCases: [...testCases, ...testCasesResponse.content],
          page: testCasesResponse.page,
          ...(isFirstPage && { addedToPlanIds: testCasesAddedToTestPlanIds }),
        });
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
      } finally {
        hideSpinner();
      }
    },
    [projectKey, testPlanId, updateFolderTestCases, folderId, testCases, showSpinner, hideSpinner],
  );

  const fetchNextPage = useCallback(() => {
    if (isFolderLoading || !hasNextPage || !page) {
      return;
    }

    const offset = (page.number + 1) * page.size;

    void fetchTestCases(offset);
  }, [isFolderLoading, hasNextPage, page, fetchTestCases]);

  useEffect(() => {
    if (isOpen && testsCount > 0 && !hasFetched && !isFolderLoading) {
      void fetchTestCases(0);
    }
  }, [isOpen, testsCount, hasFetched, isFolderLoading, fetchTestCases]);

  return {
    fetchNextPage,
    hasNextPage,
    isLoading,
  };
};
