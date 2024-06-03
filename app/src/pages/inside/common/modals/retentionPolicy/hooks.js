/*
 * Copyright 2024 EPAM Systems
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

import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { RETENTION_POLICY_KEY } from 'common/constants/retentionPolicy';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';

const messages = defineMessages({
  successNotification: {
    id: 'RetentionPolicy.successNotification',
    defaultMessage: 'Launch has been updated successfully',
  },
});

export const useFetchRetentionPolicy = (policy, activeProject, launch, onSuccess) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const fetchRetentionPolicy = async () => {
    try {
      await fetch(URLS.singleLaunchUpdate(activeProject, launch.id), {
        method: 'PUT',
        data: {
          attributes: [
            ...launch.attributes,
            {
              key: RETENTION_POLICY_KEY,
              value: policy,
              system: true,
            },
          ],
        },
      });

      const updatedLaunch = {
        ...launch,
        retentionPolicy: policy,
      };

      dispatch(
        showNotification({
          message: formatMessage(messages.successNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        }),
      );

      onSuccess(updatedLaunch);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        }),
      );
    }
  };

  return { fetchRetentionPolicy };
};
