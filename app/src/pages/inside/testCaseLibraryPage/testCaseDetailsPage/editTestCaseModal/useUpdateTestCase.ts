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
import { projectKeySelector } from 'controllers/project';
import {
  GET_TEST_CASE_DETAILS,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
} from 'controllers/testCase';
import { useDebouncedSpinnerFormSubmit } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export interface UpdateTestCasePayload {
  name: string;
  priority: string;
  testFolderId: number;
}

interface BulkUpdateTestCasesPayload {
  testCaseIds: number[];
  priority: string;
  folderId?: string;
}

export const useUpdateTestCase = () => {
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const { isLoading: isUpdateTestCaseLoading, submit: updateTestCase } =
    useDebouncedSpinnerFormSubmit({
      requestFn: async (testCaseId: number, payload: UpdateTestCasePayload) => {
        await fetch(URLS.testCaseDetails(projectKey, testCaseId), {
          method: 'patch',
          data: payload,
        });

        return testCaseId;
      },
      successMessageId: 'testCaseUpdatedSuccess',
      onSuccess: (testCaseId) => {
        dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
      },
      onError: (error: unknown) => {
        dispatch(
          showErrorNotification({
            message: (error as Error).message,
          }),
        );
      },
    });

  const { submit: bulkUpdateTestCasesExecute } = useDebouncedSpinnerFormSubmit({
    requestFn: async (payload: BulkUpdateTestCasesPayload, onSuccessCallback: () => void) => {
      await fetch(URLS.bulkUpdateTestCases(projectKey), {
        method: 'patch',
        data: { ...payload },
      });

      onSuccessCallback();
      if (payload.folderId) {
        dispatch(getTestCaseByFolderIdAction({ folderId: Number(payload.folderId) }));
      } else {
        dispatch(getAllTestCasesAction());
      }

      return payload;
    },
    onSuccess: (payload) => {
      dispatch(
        showSuccessNotification({
          messageId:
            payload.testCaseIds.length > 1 ? 'testCaseBulkUpdateSuccess' : 'testCaseUpdatedSuccess',
        }),
      );
    },
    onError: (error: unknown) => {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    },
  });

  return {
    isUpdateTestCaseLoading,
    updateTestCase,
    bulkUpdateTestCases: bulkUpdateTestCasesExecute,
  };
};
