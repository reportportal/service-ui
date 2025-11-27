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

import { useDispatch, useSelector } from 'react-redux';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { GET_TEST_CASE_DETAILS } from 'controllers/testCase';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useRefetchCurrentTestCases } from '../../hooks/useRefetchCurrentTestCases';

export interface UpdateTestCasePayload {
  name: string;
  priority: string;
  testFolderId: number;
}

interface BulkUpdateTestCasesPayload {
  testCaseIds: number[];
  priority: string;
}

export const useUpdateTestCase = () => {
  const { isLoading: isUpdateTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();

  const updateTestCase = async (testCaseId: number, payload: UpdateTestCasePayload) => {
    try {
      showSpinner();

      await fetch(URLS.testCaseDetails(projectKey, testCaseId), {
        method: 'patch',
        data: payload,
      });

      dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testCaseUpdatedSuccess',
        }),
      );
    } catch (error: unknown) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  const bulkUpdateTestCases = async (
    payload: BulkUpdateTestCasesPayload,
    onSuccess: () => void,
  ) => {
    try {
      showSpinner();

      await fetch(URLS.testCasesBatch(projectKey), {
        method: 'patch',
        data: { ...payload },
      });

      onSuccess();

      refetchCurrentTestCases();

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId:
            payload.testCaseIds.length > 1 ? 'testCaseBulkUpdateSuccess' : 'testCaseUpdatedSuccess',
        }),
      );
    } catch (error: unknown) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  return { isUpdateTestCaseLoading, updateTestCase, bulkUpdateTestCases };
};
