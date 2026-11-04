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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { RETENTION_POLICY_KEY } from 'common/constants/retentionPolicy';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';

import { ManualLaunchItem } from '../types';
import { UseChangeRetentionPolicyParams } from './types';
import { messages } from './messages';

export const useChangeRetentionPolicy = ({
  launchId,
  policy,
  onSuccess,
}: UseChangeRetentionPolicyParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const changeRetentionPolicy = useCallback(async () => {
    setIsLoading(true);

    try {
      const { attributes = [] } = await fetch<ManualLaunchItem>(
        URLS.manualLaunchById(projectKey, launchId),
      );

      await fetch(URLS.singleLaunchUpdate(projectKey, launchId), {
        method: 'PUT',
        data: {
          attributes: [
            ...attributes.filter(({ key }) => key !== RETENTION_POLICY_KEY),
            { key: RETENTION_POLICY_KEY, value: policy, system: true },
          ],
        },
      });

      dispatch(showSuccessNotification({ message: formatMessage(messages.launchUpdatedSuccess) }));
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
  }, [dispatch, projectKey, launchId, policy, formatMessage, onSuccess]);

  return { isLoading, changeRetentionPolicy };
};
