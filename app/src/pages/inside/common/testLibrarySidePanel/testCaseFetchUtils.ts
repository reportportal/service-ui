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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { Page } from 'types/common';

export interface TestCasesResponse {
  content: TestCase[];
  page: Page;
}

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
