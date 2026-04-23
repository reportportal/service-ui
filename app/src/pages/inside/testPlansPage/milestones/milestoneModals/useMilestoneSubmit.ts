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

import { useDispatch } from 'react-redux';
import { isUndefined } from 'es-toolkit';

import { fetch } from 'common/utils';
import { useDebouncedSpinner, useQueryParams } from 'common/hooks';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  defaultMilestoneQueryParams,
  getMilestonesAction,
  TmsMilestoneRS,
} from 'controllers/milestone';

import type { MilestoneSubmitPayload, UseMilestoneSubmitParams } from './types';

export const useMilestoneSubmit = ({
  url,
  method,
  successMessageId,
  onSuccess,
}: UseMilestoneSubmitParams) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const queryParams = useQueryParams(defaultMilestoneQueryParams);

  const submit = async (payload: MilestoneSubmitPayload) => {
    try {
      showSpinner();

      await fetch<TmsMilestoneRS>(url, {
        method,
        data: {
          name: payload.name,
          type: payload.type,
          status: payload.status,
          startDate: payload.startDate,
          endDate: payload.endDate,
          ...(isUndefined(payload.testPlans) ? {} : { testPlans: payload.testPlans }),
        },
      });

      onSuccess?.();
      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: successMessageId,
        }),
      );
      dispatch(getMilestonesAction(queryParams));
    } catch {
      dispatch(
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  return {
    isLoading,
    submit,
  };
};
