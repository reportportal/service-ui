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
import { isNumber, isString } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { LaunchFormData } from 'pages/inside/common/launchFormFields/types';

import { EditManualLaunchDto, UseEditManualLaunchParams } from './types';
import { messages } from './messages';

export const useEditManualLaunch = ({ launchId, onSuccess }: UseEditManualLaunchParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const handleSubmit = useCallback(
    async (formValues: LaunchFormData) => {
      setIsLoading(true);

      try {
        const { name, description, testPlan, attributes } = formValues;
        const launchName = isString(name) ? name : '';

        const launchData: EditManualLaunchDto = {
          name: launchName,
          description: description || '',
          attributes: attributes?.filter((attr) => attr.value) || [],
          ...(isNumber(testPlan?.id) && { testPlanId: testPlan.id }),
        };

        await fetch(URLS.manualLaunchById(projectKey, launchId), {
          method: 'PATCH',
          data: launchData,
        });

        dispatch(
          showSuccessNotification({
            message: formatMessage(messages.launchUpdatedSuccess, { launchName }),
          }),
        );

        onSuccess?.();
        dispatch(hideModalAction());
      } catch (error: unknown) {
        const { message } = (error as Record<string, string>) ?? {};

        dispatch(
          showErrorNotification({
            message: message || formatMessage(messages.launchUpdateFailed),
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, projectKey, formatMessage, onSuccess, launchId],
  );

  return {
    handleSubmit,
    isLoading,
  };
};
