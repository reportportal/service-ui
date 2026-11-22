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

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isString } from 'es-toolkit';
import { isEmpty, isNumber } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { BatchResult, getApiErrorMessage, readBatchResult } from 'common/utils/apiResponse';
import {
  batchPartialFailureNotificationAction,
  getBatchFailedIds,
} from 'common/manualLaunches/batchResultNotifications';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import {
  showErrorNotification,
  showSuccessNotification,
  showWarningNotification,
} from 'controllers/notification';
import { foldersSelector } from 'controllers/testCase';
import type { Folder } from 'controllers/testCase/types';
import type { BatchAddTestCasesRQ } from 'controllers/testPlan/types';
import { getAllSubfolderIds } from 'common/utils/folderUtils';
import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';

import { getIsManualCovered } from 'pages/inside/common/testCaseList/utils';
import { CreateManualLaunchDto, isLaunchObject, LaunchFormData, LaunchMode } from './types';
import { ExtendedTestCase } from 'types/testCase';
import { ManualLaunchItem } from 'pages/inside/manualLaunchesPage/types';
import { generateUUID } from './utils';
import { messages } from './messages';
import { fetchAllTestPlanTestCases } from '../testLibrarySidePanel/utils';

const resolveTestCaseIds = ({
  selectedTestCaseIds,
  submitTestCases,
  uncoveredTestsOnly,
}: {
  selectedTestCaseIds?: number[];
  submitTestCases: ExtendedTestCase[];
  uncoveredTestsOnly?: boolean;
}): number[] => {
  if (selectedTestCaseIds?.length) {
    if (!uncoveredTestsOnly) {
      return selectedTestCaseIds;
    }

    return selectedTestCaseIds.filter((id) => {
      const testCase = submitTestCases.find((item) => item.id === id);

      return testCase ? !getIsManualCovered(testCase.lastExecution?.status) : true;
    });
  }

  const addedTestCases = uncoveredTestsOnly
    ? submitTestCases.filter((testCase) => !getIsManualCovered(testCase.lastExecution?.status))
    : submitTestCases;

  return addedTestCases.map((testCase) => testCase.id);
};

// Test cases of the given folders and their subfolders according to the library folder tree; 0 when
// the tree is not loaded (the server enforces the same limit).
const countSubtreeTestCases = (folderIds: number[], folders: Folder[]): number => {
  const subtreeIds = new Set(
    folderIds.flatMap((folderId) => getAllSubfolderIds(folderId, folders)),
  );

  return folders
    .filter(({ id }) => subtreeIds.has(id))
    .reduce((total, { countOfTestCases }) => total + (countOfTestCases || 0), 0);
};

const buildCreateManualLaunchDto = ({
  formValues,
  testCaseIds,
  folderIds,
  testPlanId,
}: {
  formValues: LaunchFormData;
  testCaseIds: number[];
  folderIds?: number[];
  testPlanId?: number | null;
}): CreateManualLaunchDto => ({
  name: isString(formValues.name) ? formValues.name : '',
  uuid: generateUUID(),
  startTime: new Date().toISOString(),
  mode: 'DEFAULT',
  testCaseIds,
  ...(!isEmpty(folderIds) && { folderIds }),
  attributes: (formValues.attributes || []).filter((attr) => attr.key && attr.value),
  description: formValues.description || '',
  ...(isNumber(testPlanId) && { testPlan: { id: testPlanId } }),
});

const createNewManualLaunch = async (
  projectKey: string,
  launchData: CreateManualLaunchDto,
): Promise<void> => {
  await fetch(URLS.manualLaunch(projectKey), {
    method: 'POST',
    data: launchData,
  });
};

interface AddToExistingLaunchResult {
  result: BatchResult;
  // Set when the test cases were added to the launch but syncing them to its test plan failed.
  planSyncError?: unknown;
}

// Only the test cases that really landed in the launch go to its test plan. Folders go as they are:
// the server adds their subtrees idempotently, so the plan gets the same test cases in one request.
const getPlanSyncRequest = (
  { testCaseIds = [], folderIds }: BatchAddTestCasesRQ,
  result: BatchResult,
): BatchAddTestCasesRQ | null => {
  if (!isEmpty(folderIds)) {
    return result.successCount > 0 ? { folderIds } : null;
  }

  const failedTestCaseIds = getBatchFailedIds(result);
  let addedTestCaseIds: number[] = [];

  if (!isEmpty(result.successIds)) {
    addedTestCaseIds = result.successIds.map(Number);
  } else if (failedTestCaseIds.length === result.failureCount) {
    addedTestCaseIds = testCaseIds.filter((id) => !failedTestCaseIds.includes(id));
  }

  return isEmpty(addedTestCaseIds) ? null : { testCaseIds: addedTestCaseIds };
};

const addTestCasesToExistingLaunch = async (
  projectKey: string,
  launchId: number,
  request: BatchAddTestCasesRQ,
): Promise<AddToExistingLaunchResult> => {
  const response: unknown = await fetch(URLS.batchAddTestCasesToLaunch(projectKey, launchId), {
    method: 'POST',
    data: request,
  });
  const result = readBatchResult(response, request.testCaseIds?.length);
  const planSyncRequest = getPlanSyncRequest(request, result);

  if (!planSyncRequest) {
    return { result };
  }

  try {
    const launchDetail: ManualLaunchItem = await fetch(URLS.manualLaunchById(projectKey, launchId));
    const linkedTestPlanId = launchDetail?.testPlan?.id;

    if (isNumber(linkedTestPlanId)) {
      await fetch(URLS.testPlanTestCasesBatch(projectKey, linkedTestPlanId), {
        method: 'POST',
        data: planSyncRequest,
      });
    }
  } catch (planSyncError) {
    return { result, planSyncError };
  }

  return { result };
};

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  activeMode: LaunchMode,
  testPlanId?: number | null,
  selectedLaunchId?: number,
  folderIds?: number[],
  onClearSelection?: () => void,
  onSubmitSuccess?: (mode: LaunchMode) => void,
  selectedTestCaseIds?: number[],
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const folders = useSelector(foldersSelector);
  const { formatMessage } = useIntl();

  const showLaunchCreationError = useCallback(() => {
    dispatch(
      showErrorNotification({
        message: formatMessage(messages.launchCreationFailed),
      }),
    );
  }, [dispatch, formatMessage]);

  const isFolderSubmit = !isEmpty(folderIds);

  const getTestCasesForSubmit = useCallback(async () => {
    try {
      if (isNumber(testPlanId) && !selectedTestCaseIds?.length) {
        return await fetchAllTestPlanTestCases(projectKey, testPlanId);
      }

      return testCases;
    } catch {
      showLaunchCreationError();

      return null;
    }
  }, [projectKey, selectedTestCaseIds, showLaunchCreationError, testCases, testPlanId]);

  const finishSuccessfully = useCallback(() => {
    onSubmitSuccess?.(activeMode);
    onClearSelection?.();
    dispatch(hideModalAction());
  }, [activeMode, dispatch, onClearSelection, onSubmitSuccess]);

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      if (isFolderSubmit) {
        const folderTestCasesCount = countSubtreeTestCases(folderIds ?? [], folders);

        if (folderTestCasesCount > ADD_BY_FOLDER_LIMIT) {
          dispatch(
            showErrorNotification({
              messageId: 'addByFolderLimitExceeded',
              values: { count: folderTestCasesCount, limit: ADD_BY_FOLDER_LIMIT },
            }),
          );

          return;
        }
      }

      setIsLoading(true);

      const resolvedTestPlanId = testPlanId ?? formValues.testPlan?.id;
      const isWholeTestPlanSubmit =
        isNumber(resolvedTestPlanId) && !isFolderSubmit && !selectedTestCaseIds?.length;
      const shouldCreateWholePlan =
        activeMode === LaunchMode.NEW && isWholeTestPlanSubmit && !formValues.uncoveredTestsOnly;

      try {
        let testCaseIds: number[] = [];
        let primaryTestCaseName: string | undefined;

        // Folders are resolved by the server, so no test case of them is downloaded here.
        if (!shouldCreateWholePlan && !isFolderSubmit) {
          const submitTestCases = await getTestCasesForSubmit();

          if (!submitTestCases) {
            return;
          }

          testCaseIds = resolveTestCaseIds({
            selectedTestCaseIds,
            submitTestCases,
            uncoveredTestsOnly: formValues.uncoveredTestsOnly,
          });

          if (isEmpty(testCaseIds)) {
            showLaunchCreationError();

            return;
          }

          primaryTestCaseName = submitTestCases.find(
            (testCase) => testCase.id === testCaseIds[0],
          )?.name;
        }

        if (activeMode === LaunchMode.EXISTING) {
          const launchId = isLaunchObject(formValues.name) ? formValues.name.id : selectedLaunchId;

          if (!launchId) {
            return;
          }

          const { result, planSyncError } = await addTestCasesToExistingLaunch(
            projectKey,
            launchId,
            isFolderSubmit ? { folderIds } : { testCaseIds },
          );

          if (result.failureCount > 0) {
            dispatch(batchPartialFailureNotificationAction(result));
          } else {
            dispatch(
              showSuccessNotification({
                message:
                  isFolderSubmit || testCaseIds.length > 1
                    ? formatMessage(messages.testCasesAddedSuccess)
                    : formatMessage(messages.testCaseAddedSuccess, {
                        testCaseName: primaryTestCaseName,
                      }),
              }),
            );
          }

          if (planSyncError) {
            dispatch(
              showWarningNotification({
                message: formatMessage(messages.testPlanSyncFailed, {
                  reason: getApiErrorMessage(planSyncError) ?? '',
                }),
              }),
            );
          }

          if (result.successCount === 0) {
            // Nothing was added: keep the modal open so the user can change the selection.
            return;
          }
        } else if (activeMode === LaunchMode.NEW) {
          const launchData = buildCreateManualLaunchDto({
            formValues,
            testCaseIds,
            folderIds,
            testPlanId: resolvedTestPlanId,
          });

          await createNewManualLaunch(projectKey, launchData);

          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.launchCreatedSuccess, {
                launchName: launchData.name,
              }),
            }),
          );
        } else {
          return;
        }

        finishSuccessfully();
      } catch (error: unknown) {
        const { message } = (error as Record<string, string>) ?? {};

        dispatch(
          showErrorNotification({
            message: message || formatMessage(messages.launchCreationFailed),
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      testPlanId,
      getTestCasesForSubmit,
      isFolderSubmit,
      folderIds,
      folders,
      selectedTestCaseIds,
      selectedLaunchId,
      activeMode,
      finishSuccessfully,
      dispatch,
      projectKey,
      formatMessage,
      showLaunchCreationError,
    ],
  );

  return {
    handleSubmit,
    isLoading,
  };
};
