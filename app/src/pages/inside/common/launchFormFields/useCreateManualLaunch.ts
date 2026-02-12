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

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isString } from 'es-toolkit';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';

import { LaunchFormData, LaunchMode, isLaunchObject, CreateManualLaunchDto } from './types';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { generateUUID } from './utils';
import { messages } from './messages';

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  activeMode: LaunchMode,
  testPlanId?: number,
  selectedLaunchId?: number,
  onClearSelection?: () => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      const resolvedTestPlanId = testPlanId ?? formValues.testPlan?.id;

      const testCaseIds = formValues.uncoveredTestsOnly
        ? testCases.filter((testCase) => !testCase.lastExecution).map((testCase) => testCase.id)
        : testCases.map((testCase) => testCase.id);

      try {
        const launchId = isLaunchObject(formValues.name) ? formValues.name.id : selectedLaunchId;

        if (activeMode === LaunchMode.EXISTING && launchId) {
          await fetch(URLS.batchAddTestCasesToLaunch(projectKey, launchId), {
            method: 'POST',
            data: { testCaseIds },
          });

          dispatch(
            showSuccessNotification({
              message:
                testCaseIds.length > 1
                  ? formatMessage(messages.testCasesAddedSuccess)
                  : formatMessage(messages.testCaseAddedSuccess, {
                      testCaseName: testCases[0]?.name,
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
            ...(resolvedTestPlanId && { testPlanId: resolvedTestPlanId }),
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
      testCases,
      activeMode,
      testPlanId,
      selectedLaunchId,
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
