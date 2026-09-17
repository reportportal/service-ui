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
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { foldersSelector } from 'controllers/testCase';
import { getAllSubfolderIds } from 'common/utils/folderUtils';

import { getIsManualCovered } from 'pages/inside/common/testCaseList/utils';
import {
  CreateManualLaunchDto,
  isLaunchObject,
  LaunchFormData,
  LaunchMode,
} from './types';
import { ExtendedTestCase } from 'types/testCase';
import { ManualLaunchItem } from 'pages/inside/manualLaunchesPage/types';
import { generateUUID } from './utils';
import { messages } from './messages';
import { fetchAllTestCases, fetchAllTestPlanTestCases } from '../testLibrarySidePanel/utils';

const resolveTestCaseIds = ({
  folderId,
  selectedTestCaseIds,
  submitTestCases,
  uncoveredTestsOnly,
}: {
  folderId?: number;
  selectedTestCaseIds?: number[];
  submitTestCases: ExtendedTestCase[];
  uncoveredTestsOnly?: boolean;
}): number[] => {
  if (!folderId && selectedTestCaseIds?.length) {
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

const buildCreateManualLaunchDto = ({
  formValues,
  testCaseIds,
  testPlanId,
}: {
  formValues: LaunchFormData;
  testCaseIds: number[];
  testPlanId?: number | null;
}): CreateManualLaunchDto => ({
  name: isString(formValues.name) ? formValues.name : '',
  uuid: generateUUID(),
  startTime: new Date().toISOString(),
  mode: 'DEFAULT',
  testCaseIds,
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

const addTestCasesToExistingLaunch = async (
  projectKey: string,
  launchId: number,
  testCaseIds: number[],
): Promise<void> => {
  await fetch(URLS.batchAddTestCasesToLaunch(projectKey, launchId), {
    method: 'POST',
    data: { testCaseIds },
  });

  const launchDetail: ManualLaunchItem = await fetch(
    URLS.manualLaunchById(projectKey, launchId),
  );
  const linkedTestPlanId = launchDetail?.testPlan?.id;

  if (isNumber(linkedTestPlanId)) {
    await fetch(URLS.testPlanTestCasesBatch(projectKey, linkedTestPlanId), {
      method: 'POST',
      data: { testCaseIds },
    });
  }
};

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  activeMode: LaunchMode,
  testPlanId?: number | null,
  selectedLaunchId?: number,
  folderId?: number,
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

  const getTestCasesForSubmit = useCallback(async () => {
    try {
      if (folderId) {
        return await fetchAllTestCases(projectKey, {
          'filter.in.testFolderId': getAllSubfolderIds(folderId, folders).join(','),
          offset: 0,
          limit: 50,
        });
      }

      if (isNumber(testPlanId) && !selectedTestCaseIds?.length) {
        return await fetchAllTestPlanTestCases(projectKey, testPlanId);
      }

      return testCases;
    } catch {
      showLaunchCreationError();

      return null;
    }
  }, [
    folderId,
    folders,
    projectKey,
    selectedTestCaseIds,
    showLaunchCreationError,
    testCases,
    testPlanId,
  ]);

  const finishSuccessfully = useCallback(() => {
    onSubmitSuccess?.(activeMode);
    onClearSelection?.();
    dispatch(hideModalAction());
  }, [activeMode, dispatch, onClearSelection, onSubmitSuccess]);

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      const resolvedTestPlanId = testPlanId ?? formValues.testPlan?.id;
      const isWholeTestPlanSubmit =
        isNumber(resolvedTestPlanId) && !folderId && !selectedTestCaseIds?.length;
      const shouldCreateWholePlan =
        activeMode === LaunchMode.NEW &&
        isWholeTestPlanSubmit &&
        !formValues.uncoveredTestsOnly;

      try {
        let testCaseIds: number[] = [];
        let primaryTestCaseName: string | undefined;

        if (!shouldCreateWholePlan) {
          const submitTestCases = await getTestCasesForSubmit();

          if (!submitTestCases) {
            return;
          }

          testCaseIds = resolveTestCaseIds({
            folderId,
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
          const launchId = isLaunchObject(formValues.name)
            ? formValues.name.id
            : selectedLaunchId;

          if (!launchId) {
            return;
          }

          await addTestCasesToExistingLaunch(projectKey, launchId, testCaseIds);

          dispatch(
            showSuccessNotification({
              message:
                testCaseIds.length > 1
                  ? formatMessage(messages.testCasesAddedSuccess)
                  : formatMessage(messages.testCaseAddedSuccess, {
                      testCaseName: primaryTestCaseName,
                    }),
            }),
          );
        } else if (activeMode === LaunchMode.NEW) {
          const launchData = buildCreateManualLaunchDto({
            formValues,
            testCaseIds,
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
      folderId,
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
