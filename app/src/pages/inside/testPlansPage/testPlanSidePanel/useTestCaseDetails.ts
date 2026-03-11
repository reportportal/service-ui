/*
 * Copyright 2025 EPAM Systems
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

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { showErrorNotification } from 'controllers/notification';
import { useDebouncedSpinner } from 'common/hooks';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { getIsManualCovered } from 'pages/inside/common/testCaseList/utils';

interface UseTestCaseDetailsParams {
  testCaseId: number | null;
  testPlanId?: number | null;
}

export const useTestCaseDetails = ({ testCaseId, testPlanId }: UseTestCaseDetailsParams) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const [testCaseDetails, setTestCaseDetails] = useState<ExtendedTestCase | null>(null);

  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  useEffect(() => {
    if (!testCaseId) {
      setTestCaseDetails(null);
      return;
    }

    const abortController = new AbortController();

    const fetchTestCaseDetails = async () => {
      try {
        showSpinner();

        const url =
          testPlanId && testCaseId
            ? URLS.testPlanTestCaseDetails(projectKey, testPlanId, testCaseId)
            : URLS.testCaseDetails(projectKey, testCaseId);

        const response = await fetch<ExtendedTestCase>(url, {
          signal: abortController.signal,
        });

        setTestCaseDetails(response);
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        dispatch(
          showErrorNotification({
            messageId: 'errorOccurredTryAgain',
          }),
        );
      } finally {
        if (!abortController.signal.aborted) {
          hideSpinner();
        }
      }
    };

    void fetchTestCaseDetails();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey, testCaseId, testPlanId]);

  const isManualCovered = useMemo(
    () => getIsManualCovered(testCaseDetails?.lastExecution?.status),
    [testCaseDetails?.lastExecution?.status],
  );

  return {
    testCaseDetails,
    isLoading,
    isManualCovered,
  };
};
