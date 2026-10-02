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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { TestCase } from 'types/testCase';
import { Page } from 'types/common';

import { chunkIdsForQueryFilter } from './chunkIdsForQueryFilter';

export interface TestCasesResponse {
  content: TestCase[];
  page: Page;
}

export const TEST_FOLDER_ID_IN_FILTER_KEY = 'filter.in.testFolderId';
export const MAX_CONCURRENT_FOLDER_CHUNK_FETCHES = 5;

export const fetchAllTestCases = async (
  projectKey: string,
  params: Record<string, string | number>,
  fetchedTestCases: TestCase[] = [],
): Promise<TestCase[]> => {
  const response = await fetch<TestCasesResponse>(URLS.testCases(projectKey, params));
  const testCases = [...fetchedTestCases, ...response.content];

  if (response.page.number < response.page.totalPages) {
    return fetchAllTestCases(
      projectKey,
      { ...params, offset: response.page.number * response.page.size },
      testCases,
    );
  }

  return testCases;
};

const fetchFolderIdChunks = async (
  projectKey: string,
  folderIdChunks: number[][],
  params: Record<string, string | number>,
  startIndex = 0,
): Promise<TestCase[]> => {
  if (startIndex >= folderIdChunks.length) {
    return [];
  }

  const batch = folderIdChunks.slice(
    startIndex,
    startIndex + MAX_CONCURRENT_FOLDER_CHUNK_FETCHES,
  );
  const batchResults = await Promise.all(
    batch.map((folderIdChunk) =>
      fetchAllTestCases(projectKey, {
        offset: 0,
        limit: 50,
        ...params,
        [TEST_FOLDER_ID_IN_FILTER_KEY]: folderIdChunk.join(','),
      }),
    ),
  );
  const remainingResults = await fetchFolderIdChunks(
    projectKey,
    folderIdChunks,
    params,
    startIndex + MAX_CONCURRENT_FOLDER_CHUNK_FETCHES,
  );

  return [...batchResults.flat(), ...remainingResults];
};

export const fetchAllTestCasesByFolderIds = async (
  projectKey: string,
  folderIds: number[],
  params: Record<string, string | number> = {},
): Promise<TestCase[]> => {
  if (isEmpty(folderIds)) {
    return [];
  }

  return fetchFolderIdChunks(projectKey, chunkIdsForQueryFilter(folderIds), params);
};
