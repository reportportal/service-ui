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

import { useRef } from 'react';
import { getFormValues, InjectedFormProps } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';

import {
  ADD_TO_TEST_PLAN_CONDITION,
  TEST_CASE_LIBRARY_EVENTS,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { getApiErrorMessage, readBatchResult } from 'common/utils/apiResponse';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import type { BatchAddTestCasesRQ, TestPlanDto } from 'controllers/testPlan/types';
import { batchPartialFailureNotification } from 'controllers/testPlan/batchResult';
import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';

import {
  AddTestCasesToTestPlanFormData,
  AddTestCasesToTestPlanModalData,
  AddTestCasesToTestPlanModalProps,
} from './types';
import { ADD_TO_TEST_PLAN_MODAL_FORM, SELECTED_TEST_PLAN_FIELD_NAME } from './constants';

export const useAddTestCasesToTestPlan = ({
  folderId,
  itemCount,
  selectedTestCaseIds,
  change,
}: AddTestCasesToTestPlanModalData &
  Pick<
    InjectedFormProps<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>,
    'change'
  >) => {
  const {
    isLoading: isAddTestCasesToTestPlanLoading,
    showSpinner,
    hideSpinner,
  } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const autompleteInputRef = useRef<HTMLInputElement>(null);

  const isFromFolder = folderId !== undefined;

  const { selectedTestPlan } = useSelector(
    (state) =>
      (getFormValues(ADD_TO_TEST_PLAN_MODAL_FORM)(state) || {}) as AddTestCasesToTestPlanFormData,
  );

  const inputRefFunction = (node: HTMLInputElement) => {
    autompleteInputRef.current = node;
  };

  const setSelectedTestPlan = (value: TestPlanDto | null) => {
    change(SELECTED_TEST_PLAN_FIELD_NAME, value || null);
    autompleteInputRef.current?.blur();
  };

  // A folder is sent as is: the server adds its whole subtree, so no test case is downloaded here.
  const getRequest = (): { data: BatchAddTestCasesRQ; count: number } => {
    if (isFromFolder) {
      return { data: { folderIds: [folderId] }, count: itemCount ?? 0 };
    }

    return {
      data: { testCaseIds: selectedTestCaseIds || [] },
      count: selectedTestCaseIds?.length || 0,
    };
  };

  const addTestCasesToTestPlan = async (values: AddTestCasesToTestPlanFormData): Promise<void> => {
    const testPlan = values?.[SELECTED_TEST_PLAN_FIELD_NAME];
    const { data, count } = getRequest();

    if (isEmpty(data.folderIds) && isEmpty(data.testCaseIds)) {
      return;
    }

    // an empty folder (known count) has nothing to add: no request and no success toast
    if (isFromFolder && itemCount === 0) {
      return;
    }

    if (isFromFolder && count > ADD_BY_FOLDER_LIMIT) {
      showErrorNotification({
        messageId: 'addByFolderLimitExceeded',
        values: { count, limit: ADD_BY_FOLDER_LIMIT },
      });

      return;
    }

    const isSingleTestCaseMode = count === 1;

    const addToTestPlanCondition = isSingleTestCaseMode
      ? ADD_TO_TEST_PLAN_CONDITION.SINGLE
      : ADD_TO_TEST_PLAN_CONDITION.BULK;

    const fetchPath = (
      URLS.testPlanTestCasesBatch as (projectKey: string, testPlanId: number) => string
    )(projectKey, testPlan.id);

    showSpinner();

    await fetch(fetchPath, {
      method: 'post',
      data,
    })
      .then((response: unknown) => {
        const batchResult = readBatchResult(response, data.testCaseIds?.length);

        trackEvent(TEST_CASE_LIBRARY_EVENTS.submitAddToTestPlan(addToTestPlanCondition));

        if (batchResult.failureCount > 0) {
          // keep the modal open so the user sees what was not added
          dispatch(batchPartialFailureNotification(batchResult));

          return;
        }

        dispatch(hideModalAction());
        showSuccessNotification({
          messageId:
            batchResult.successCount === 1
              ? 'testCaseAddingToTestPlanSuccess'
              : 'testCasesAddingToTestPlanSuccess',
        });
      })
      .catch((error) => {
        const message = getApiErrorMessage(error);
        const fallbackMessageId = isSingleTestCaseMode
          ? 'testCaseAddingToTestPlanFailed'
          : 'testCasesAddingToTestPlanFailed';

        showErrorNotification({
          message,
          messageId: message ? undefined : fallbackMessageId,
        });
        console.error(error);
      })
      .finally(() => {
        hideSpinner();
      });
  };

  return {
    isAddTestCasesToTestPlanLoading,
    selectedTestPlan,
    addTestCasesToTestPlan,
    setSelectedTestPlan,
    inputRefFunction,
  };
};
