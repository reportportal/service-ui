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
import { useIntl } from 'react-intl';
import { noop } from 'es-toolkit';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { getTestPlanAction, defaultTestPlanTestCasesQueryParams } from 'controllers/testPlan';
import { useTestPlanId } from 'hooks/useTypedSelector';

import { messages } from './messages';
import { UseRemoveTestCasesFromTestPlanOptions } from './types';

export const useRemoveTestCasesFromTestPlan = ({
  onSuccess = noop,
}: UseRemoveTestCasesFromTestPlanOptions) => {
  const { formatMessage } = useIntl();
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testPlanId = useTestPlanId();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const removeTestCasesFromTestPlan = useCallback(
    async (testCaseIds: number[]) => {
      try {
        showSpinner();

        await fetch(URLS.testPlanTestCasesBatch(projectKey, Number(testPlanId)), {
          method: 'delete',
          data: {
            testCaseIds,
          },
        });

        dispatch(
          getTestPlanAction({
            testPlanId: Number(testPlanId),
            ...defaultTestPlanTestCasesQueryParams,
          }),
        );

        showSuccessNotification({
          messageId: 'removeFromTestPlanSuccess',
          values: { count: testCaseIds.length },
        });

        onSuccess?.();
      } catch (error) {
        showErrorNotification({
          message: (error as Error).message || formatMessage(messages.removeFromTestPlanError),
        });
        throw error;
      } finally {
        hideSpinner();
      }
    },
    [
      formatMessage,
      showSpinner,
      projectKey,
      testPlanId,
      dispatch,
      showSuccessNotification,
      onSuccess,
      showErrorNotification,
      hideSpinner,
    ],
  );

  return {
    isLoading,
    removeTestCasesFromTestPlan,
  };
};
