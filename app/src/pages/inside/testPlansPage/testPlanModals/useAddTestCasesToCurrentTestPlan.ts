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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { getTestPlanAction, defaultTestPlanTestCasesQueryParams } from 'controllers/testPlan';
import { useTestPlanId } from 'hooks/useTypedSelector';

export const useAddTestCasesToCurrentTestPlan = () => {
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testPlanId = useTestPlanId();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();

  const addTestCasesToCurrentTestPlan = useCallback(
    async (testCaseIds: number[]) => {
      const numericTestPlanId = Number(testPlanId);

      if (!numericTestPlanId) {
        return false;
      }

      try {
        showSpinner();

        await fetch(URLS.testPlanTestCasesBatch(projectKey, numericTestPlanId), {
          method: 'post',
          data: {
            testCaseIds,
          },
        });

        dispatch(
          getTestPlanAction({
            testPlanId: numericTestPlanId,
            ...defaultTestPlanTestCasesQueryParams,
          }),
        );

        showSuccessNotification({
          messageId: 'testCasesAddedToTestPlanFromLibrarySuccess',
        });

        return true;
      } catch (error) {
        showErrorNotification({
          messageId: 'testCasesAddingToTestPlanFailed',
        });
        console.error(error);

        return false;
      } finally {
        hideSpinner();
      }
    },
    [
      projectKey,
      testPlanId,
      dispatch,
      showSpinner,
      hideSpinner,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return {
    isAddingTestCases: isLoading,
    addTestCasesToCurrentTestPlan,
  };
};
