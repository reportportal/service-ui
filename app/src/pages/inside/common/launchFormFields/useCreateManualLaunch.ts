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
import { isNumber } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { foldersSelector } from 'controllers/testCase';
import { getAllSubfolderIds } from 'common/utils/folderUtils';

import { CreateManualLaunchDto, isLaunchObject, LaunchFormData, LaunchMode } from './types';
import { ExtendedTestCase } from 'types/testCase';
import { ManualLaunchItem } from 'pages/inside/manualLaunchesPage/types';
import { generateUUID } from './utils';
import { messages } from './messages';
import { fetchAllTestCases } from '../testLibrarySidePanel/utils';

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  activeMode: LaunchMode,
  testPlanId?: number | null,
  selectedLaunchId?: number,
  folderId?: number,
  onClearSelection?: () => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const folders = useSelector(foldersSelector);
  const { formatMessage } = useIntl();

  const getTestCasesForSubmit = useCallback(async () => {
    if (!folderId) {
      return testCases;
    }

    try {
      return await fetchAllTestCases(projectKey, {
        'filter.in.testFolderId': getAllSubfolderIds(folderId, folders).join(','),
        offset: 0,
        limit: 50,
      });
    } catch {
      dispatch(
        showErrorNotification({
          message: formatMessage(messages.launchCreationFailed),
        }),
      );

      return null;
    }
  }, [dispatch, folderId, folders, formatMessage, projectKey, testCases]);

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      const resolvedTestPlanId = testPlanId ?? formValues.testPlan?.id;
      const submitTestCases = await getTestCasesForSubmit();

      if (!submitTestCases) {
        setIsLoading(false);

        return;
      }

      const addedTestCases = formValues.uncoveredTestsOnly
        ? submitTestCases.filter((testCase) => !testCase.lastExecution)
        : submitTestCases;

      const testCaseIds = addedTestCases.map((testCase) => testCase.id);

      try {
        const launchId = isLaunchObject(formValues.name) ? formValues.name.id : selectedLaunchId;

        if (activeMode === LaunchMode.EXISTING && launchId) {
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

          dispatch(
            showSuccessNotification({
              message:
                addedTestCases.length > 1
                  ? formatMessage(messages.testCasesAddedSuccess)
                  : formatMessage(messages.testCaseAddedSuccess, {
                      testCaseName: addedTestCases[0]?.name,
                    }),
            }),
          );
        } else if (activeMode === LaunchMode.NEW) {
          const launchName = isString(formValues.name) ? formValues.name : '';
          const launchUuid = generateUUID();

          const launchData: CreateManualLaunchDto = {
            name: launchName,
            uuid: launchUuid,
            startTime: new Date().toISOString(),
            mode: 'DEFAULT',
            testCaseIds,
            attributes: formValues.attributes?.filter((attr) => attr.key && attr.value) || [],
            description: formValues.description || '',
            ...(isNumber(resolvedTestPlanId) && { testPlan: { id: resolvedTestPlanId } }),
          };

          await fetch(URLS.manualLaunch(projectKey), {
            method: 'POST',
            data: launchData,
          });

          dispatch(
            showSuccessNotification({
              message: formatMessage(messages.launchCreatedSuccess, { launchName }),
            }),
          );
        } else {
          setIsLoading(false);
          return;
        }

        onClearSelection?.();
        dispatch(hideModalAction());
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
      selectedLaunchId,
      activeMode,
      onClearSelection,
      dispatch,
      projectKey,
      formatMessage,
    ],
  );

  return {
    handleSubmit,
    isLoading,
  };
};
