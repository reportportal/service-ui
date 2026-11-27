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
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { MANUAL_LAUNCH_NOT_EXECUTED_STATUS_FILTER } from 'controllers/manualLaunch';
import { showSuccessNotification } from 'controllers/notification';
import { MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { messages } from './messages';

export const useOpenNotExecutedExecutions = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();

  return useCallback(
    (launchId: number | string) => {
      dispatch({
        type: MANUAL_LAUNCH_DETAILS_PAGE,
        payload: { organizationSlug, projectSlug, launchId: launchId.toString() },
        meta: { query: { statusFilter: MANUAL_LAUNCH_NOT_EXECUTED_STATUS_FILTER } },
      });
      dispatch(
        showSuccessNotification({ message: formatMessage(messages.notExecutedFilterApplied) }),
      );
    },
    [dispatch, formatMessage, organizationSlug, projectSlug],
  );
};
