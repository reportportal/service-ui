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

import { useEffect, useState } from 'react';

import { useNotification } from 'common/hooks/useNotification';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

import type { Page } from 'types/common';

import { HISTORY_ACTIVITY_DETAILS_FILTER_KEY } from './constants';
import type { TestCaseActivityItem, TestCaseActivityResponse } from './types';

type UseTestCaseActivityHistoryResult = {
  content: TestCaseActivityItem[];
  page: Page | null;
  isLoading: boolean;
};

const emptyResult: UseTestCaseActivityHistoryResult = {
  content: [],
  page: null,
  isLoading: false,
};

export const useTestCaseActivityHistory = (
  projectKey: string,
  testCaseId: string,
  offset: number,
  limit: number,
  detailsContains: string,
): UseTestCaseActivityHistoryResult => {
  const { showErrorNotification } = useNotification();
  const enabled = Boolean(projectKey && testCaseId);
  const [state, setState] = useState<UseTestCaseActivityHistoryResult>({
    content: [],
    page: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;

    setState({ content: [], page: null, isLoading: true });

    const safeOffset = Number(offset);
    const safeLimit = Number(limit);
    const url = URLS.testCaseActivity(projectKey, testCaseId, {
      offset: safeOffset,
      limit: safeLimit,
      ...(detailsContains
        ? { [HISTORY_ACTIVITY_DETAILS_FILTER_KEY]: detailsContains }
        : {}),
    }) as string;

    void fetch<TestCaseActivityResponse>(url)
      .then((response) => {
        if (!cancelled) {
          setState({
            content: response.content ?? [],
            page: response.page ?? null,
            isLoading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          showErrorNotification({ messageId: 'errorOccurredTryAgain' });
          setState(emptyResult);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, projectKey, testCaseId, offset, limit, detailsContains, showErrorNotification]);

  if (!enabled) {
    return emptyResult;
  }

  return state;
};
