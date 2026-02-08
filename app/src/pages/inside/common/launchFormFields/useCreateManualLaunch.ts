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

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';

import { LaunchFormData, LaunchMode } from './types';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';

export const useCreateManualLaunch = (
  testCases: ExtendedTestCase[],
  testPlanId: number,
  activeMode: LaunchMode,
  selectedLaunchId?: number,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const handleSubmit = async (formValues: LaunchFormData) => {
    setIsLoading(true);

    // Filter test cases based on uncoveredTestsOnly checkbox
    const testCaseIds = formValues.uncoveredTestsOnly
      ? testCases.filter((tc) => !tc.lastExecution).map((tc) => tc.id)
      : testCases.map((tc) => tc.id);

    try {
      if (activeMode === LaunchMode.EXISTING && selectedLaunchId) {
        // EXISTING: Add test cases to selected launch
        await fetch(URLS.batchAddTestCasesToLaunch(projectKey, selectedLaunchId), {
          method: 'POST',
          data: { testCaseIds },
        });

        dispatch(
          showSuccessNotification({
            message: `Test cases have been added to launch successfully`,
          }),
        );
      } else {
        // NEW: Create launch with test cases
        const launchName = typeof formValues.name === 'string' ? formValues.name : '';
        const launchUuid = crypto.randomUUID();

        const launchData = {
          name: launchName,
          uuid: launchUuid,
          startTime: new Date().toISOString(),
          description: formValues.description || '',
          attributes: formValues.attributes?.filter((attr) => attr.key && attr.value) || [],
          testPlanId,
          testCaseIds,
          mode: 'DEFAULT',
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
      }

      dispatch(hideModalAction());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create launch';
      dispatch(
        showErrorNotification({
          message: errorMessage,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
  };
};
