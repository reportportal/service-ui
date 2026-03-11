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

import { useEffect, useCallback, useRef } from 'react';
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

const fetchTestPlanTestCasesForFolder = async (
  projectKey: string,
  params: Record<string, string | number>,
  fetchedTestCases: TestCase[] = [],
): Promise<TestCase[]> => {
  const response = await fetch<TestCasesResponse>(URLS.testCases(projectKey, params));
  const testCases = [...fetchedTestCases, ...response.content];

  if (response.page.number < response.page.totalPages) {
    return fetchTestPlanTestCasesForFolder(
      projectKey,
      { ...params, offset: response.page.number * response.page.size },
      testCases,
    );
  }

  return testCases;
};

export const useFolderTestCases = ({ folderId, isOpen, testsCount }: UseFolderTestCasesProps) => {
  const { testPlanId, testCasesMap, updateFolderTestCases } = useTestLibraryPanelContext();
  const projectKey = useSelector(projectKeySelector);
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();

  const isFetchingFirstPageRef = useRef(false);

  const { isLoading: isFolderLoading = false, page = null } = testCasesMap.get(folderId) ?? {};

  const hasFetched = page != null;
  const hasNextPage = page ? page.number < page.totalPages : false;

  useEffect(() => {
    updateFolderTestCases(folderId, { isLoading });
  }, [folderId, isLoading, updateFolderTestCases]);

  useEffect(() => {
    if (!isOpen) {
      isFetchingFirstPageRef.current = false;
    }
  }, [isOpen]);

  const fetchTestCases = useCallback(
    async (offset: number) => {
      if (!projectKey) {
        return;
      }

      const isFirstPage = offset === 0;
      const shouldFetchTestPlanTestCases = isFirstPage && testPlanId != null;

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
          ? fetchTestPlanTestCasesForFolder(projectKey, {
              'filter.eq.testPlanId': testPlanId,
              'filter.eq.testFolderId': folderId,
              offset: 0,
              limit: 200,
            }).catch(() => [] as TestCase[])
          : Promise.resolve([] as TestCase[]);

        const [testCasesResponse, testPlanTestCases] = await Promise.all([
          testCasesPromise,
          testPlanTestCasesForFolderPromise,
        ]);

        updateFolderTestCases(folderId, {
          testCases: [
            ...(testCasesMap.get(folderId)?.testCases ?? []),
            ...testCasesResponse.content,
          ],
          page: testCasesResponse.page,
          ...(isFirstPage && { addedToTestPlanIds: testPlanTestCases.map(({ id }) => id) }),
        });
      } catch (error) {
        console.error('Failed to fetch test cases:', error);
      } finally {
        hideSpinner();
      }
    },
    [
      projectKey,
      testPlanId,
      showSpinner,
      folderId,
      updateFolderTestCases,
      testCasesMap,
      hideSpinner,
    ],
  );

  const fetchNextPage = useCallback(() => {
    if (isFolderLoading || !hasNextPage || !page) {
      return;
    }

    const offset = page.number * page.size;

    void fetchTestCases(offset);
  }, [isFolderLoading, hasNextPage, page, fetchTestCases]);

  useEffect(() => {
    if (
      !isOpen ||
      testsCount === 0 ||
      hasFetched ||
      isFolderLoading ||
      isFetchingFirstPageRef.current
    ) {
      return;
    }

    isFetchingFirstPageRef.current = true;

    void fetchTestCases(0);
  }, [isOpen, testsCount, hasFetched, isFolderLoading, fetchTestCases]);

  return {
    fetchNextPage,
    hasNextPage,
    isLoading,
  };
};
