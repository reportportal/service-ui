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

import { useCallback, useRef, useState, RefObject } from 'react';
import { groupBy } from 'es-toolkit';
import { useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { Page } from 'types/common';
import { TestCase } from 'types/testCase';

import { SetState } from '../testLibraryPanelContext';

interface TestPlanTestCasesResponse {
  content: TestCase[];
  page: Page;
}

interface UsePrefetchTestPlanCountsProps {
  testPlanId: number | null;
  isOpenRef: RefObject<boolean>;
  setTestPlanIdsByFolderId: SetState<Map<number, Set<number>>>;
}

const fetchAllTestPlanTestCases = async (
  projectKey: string,
  testPlanId: number,
  offset = 0,
  accumulated: TestCase[] = [],
): Promise<TestCase[]> => {
  const response = await fetch<TestPlanTestCasesResponse>(
    URLS.testPlanTestCases(projectKey, testPlanId, { offset, limit: 200 }),
  );
  const testCases = [...accumulated, ...response.content];

  if (response.page.number < response.page.totalPages) {
    return fetchAllTestPlanTestCases(
      projectKey,
      testPlanId,
      response.page.number * response.page.size,
      testCases,
    );
  }

  return testCases;
};

export const usePrefetchTestPlanCounts = ({
  testPlanId,
  isOpenRef,
  setTestPlanIdsByFolderId,
}: UsePrefetchTestPlanCountsProps) => {
  const projectKey = useSelector(projectKeySelector);
  const [isInitialPrefetchDone, setIsInitialPrefetchDone] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchTestPlanTestCases = useCallback(() => {
    if (!projectKey || testPlanId == null || hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    fetchAllTestPlanTestCases(projectKey, testPlanId)
      .then((testCases) => {
        if (!isOpenRef.current) {
          return;
        }

        const groupedByFolder = groupBy(testCases, ({ testFolder }) => testFolder.id);
        const entries = Object.entries(groupedByFolder).map(
          ([folderId, folderTestCases]) =>
            [Number(folderId), new Set(folderTestCases.map(({ id }) => id))] as const,
        );

        setTestPlanIdsByFolderId(new Map(entries));
      })
      .catch(() => {
        hasFetchedRef.current = false;
      })
      .finally(() => {
        setIsInitialPrefetchDone(true);
      });
  }, [projectKey, testPlanId, isOpenRef, setTestPlanIdsByFolderId]);

  const resetPrefetchCache = useCallback(() => {
    hasFetchedRef.current = false;
    setIsInitialPrefetchDone(false);
  }, []);

  return { fetchTestPlanTestCases, resetPrefetchCache, isInitialPrefetchDone };
};
