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
import { VoidFn } from '@reportportal/ui-kit/common';

import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import {
  buildCreateManualLaunchDto,
  createNewManualLaunch,
} from 'pages/inside/common/launchFormFields/useCreateManualLaunch';
import { messages as launchFormMessages } from 'pages/inside/common/launchFormFields/messages';
import { LaunchFormData } from 'pages/inside/common/launchFormFields/types';

/**
 * Creates a Manual Launch from the Manual Launches list. No test cases are sent:
 * the backend adds the test cases of the selected Test Plan to the new launch.
 */
export const useCreateManualLaunchFromList = (onSuccess?: VoidFn) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      try {
        const launchData = buildCreateManualLaunchDto({
          formValues: { ...formValues, description: formValues.description?.trim() || '' },
          testCaseIds: [],
          testPlanId: formValues.testPlan?.id,
        });

        await createNewManualLaunch(projectKey, launchData);

        dispatch(
          showSuccessNotification({
            message: formatMessage(launchFormMessages.launchCreatedSuccess, {
              launchName: launchData.name,
            }),
          }),
        );
        dispatch(hideModalAction());
        onSuccess?.();
      } catch (error: unknown) {
        const { message } = (error as Record<string, string>) ?? {};

        dispatch(
          showErrorNotification({
            message: message || formatMessage(launchFormMessages.launchCreationFailed),
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, formatMessage, onSuccess, projectKey],
  );

  return { handleSubmit, isLoading };
};
