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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';

import { LaunchFormData, LaunchMode } from './types';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import { generateUUID } from './utils';

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  activeMode: LaunchMode,
  testPlanIdProp?: number,
  selectedLaunchId?: number,
  onClearSelection?: () => void,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      // Get testPlanId from prop (disabled field) or formValues (user selection)
      const testPlanId: number | undefined = testPlanIdProp ?? formValues.testPlan?.id;

      // Filter test cases based on uncoveredTestsOnly checkbox
      const testCaseIds = formValues.uncoveredTestsOnly
        ? testCases.filter((tc) => !tc.lastExecution).map((tc) => tc.id)
        : testCases.map((tc) => tc.id);

      try {
        // Get launch ID from formValues if it's an object, or use selectedLaunchId
        const launchId =
          typeof formValues.name === 'object' && formValues.name !== null
            ? (formValues.name as { id: number }).id
            : selectedLaunchId;

        if (activeMode === LaunchMode.EXISTING && launchId) {
          // EXISTING: Add test cases to selected launch
          await fetch(URLS.batchAddTestCasesToLaunch(projectKey, launchId), {
            method: 'POST',
            data: { testCaseIds },
          });

          dispatch(
            showSuccessNotification({
              message: `Test cases have been added to launch successfully`,
            }),
          );
        } else if (activeMode === LaunchMode.NEW) {
          // NEW: Create launch with test cases
          const launchName = typeof formValues.name === 'string' ? formValues.name : '';
          const launchUuid = generateUUID();

          const launchData = {
            name: launchName,
            uuid: launchUuid,
            startTime: new Date().toISOString(),
            description: formValues.description || '',
            attributes: formValues.attributes?.filter((attr) => attr.key && attr.value) || [],
            testCaseIds,
            mode: 'DEFAULT',
            ...(testPlanId && { testPlanId }),
          };

          await fetch(URLS.createManualLaunch(projectKey), {
            method: 'POST',
            data: launchData,
          });

          dispatch(
            showSuccessNotification({
              message: `Launch "${launchName}" has been created successfully`,
            }),
          );
        } else {
          // EXISTING mode without a selected launch
          setIsLoading(false);
          return;
        }

        onClearSelection?.();
        dispatch(hideModalAction());
      } catch (error: unknown) {
        const { message = 'Failed to create launch' } = (error as Record<string, string>) ?? {};

        dispatch(
          showErrorNotification({
            message,
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      testCases,
      activeMode,
      testPlanIdProp,
      selectedLaunchId,
      onClearSelection,
      dispatch,
      projectKey,
    ],
  );

  return {
    handleSubmit,
    isLoading,
  };
};
