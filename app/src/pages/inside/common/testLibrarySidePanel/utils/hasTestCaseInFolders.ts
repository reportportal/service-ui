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

import { chunkIdsForQueryFilter } from './chunkIdsForQueryFilter';
import { TEST_FOLDER_ID_IN_FILTER_KEY, TestCasesResponse } from './fetchAllTestCases';

type TestCasePredicate = (testCase: TestCase) => boolean;
type RequestParams = Record<string, string | number>;

const hasMatchingTestCaseInFolderChunk = async (
  projectKey: string,
  folderIdChunk: number[],
  predicate: TestCasePredicate,
  params: RequestParams,
  signal?: AbortSignal,
): Promise<boolean> => {
  if (signal?.aborted) {
    return false;
  }

  const response = await fetch<TestCasesResponse>(
    URLS.testCases(projectKey, {
      ...params,
      [TEST_FOLDER_ID_IN_FILTER_KEY]: folderIdChunk.join(','),
    }),
    { signal },
  );

  if (response.content.some(predicate)) {
    return true;
  }

  if (response.page.number < response.page.totalPages) {
    return hasMatchingTestCaseInFolderChunk(
      projectKey,
      folderIdChunk,
      predicate,
      { ...params, offset: response.page.number * response.page.size },
      signal,
    );
  }

  return false;
};

const hasMatchingTestCaseInFolderChunks = async (
  projectKey: string,
  folderIdChunks: number[][],
  predicate: TestCasePredicate,
  params: RequestParams,
  signal?: AbortSignal,
  chunkIndex = 0,
): Promise<boolean> => {
  if (chunkIndex >= folderIdChunks.length || signal?.aborted) {
    return false;
  }

  const hasMatch = await hasMatchingTestCaseInFolderChunk(
    projectKey,
    folderIdChunks[chunkIndex],
    predicate,
    params,
    signal,
  );

  if (hasMatch) {
    return true;
  }

  return hasMatchingTestCaseInFolderChunks(
    projectKey,
    folderIdChunks,
    predicate,
    params,
    signal,
    chunkIndex + 1,
  );
};

export const hasTestCaseInFolders = async (
  projectKey: string,
  folderIds: number[],
  predicate: TestCasePredicate,
  params: RequestParams = {},
  signal?: AbortSignal,
): Promise<boolean> => {
  if (isEmpty(folderIds)) {
    return false;
  }

  return hasMatchingTestCaseInFolderChunks(
    projectKey,
    chunkIdsForQueryFilter(folderIds),
    predicate,
    params,
    signal,
  );
};
