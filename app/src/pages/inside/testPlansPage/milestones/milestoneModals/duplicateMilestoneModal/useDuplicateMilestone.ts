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

import { useDispatch, useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useQueryParams } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  defaultMilestoneQueryParams,
  getMilestonesAction,
  TmsMilestoneRS,
  CreateMilestonePayload,
} from 'controllers/milestone';

import type { UseDuplicateMilestoneParams } from './types';

export const useDuplicateMilestone = ({ sourceMilestoneId }: UseDuplicateMilestoneParams) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const queryParams = useQueryParams(defaultMilestoneQueryParams);

  const submitDuplicate = async (payload: CreateMilestonePayload) => {
    try {
      showSpinner();

      await fetch<TmsMilestoneRS>(URLS.tmsMilestoneDuplicate(projectKey, sourceMilestoneId), {
        method: 'post',
        data: {
          name: payload.name,
          type: payload.type,
          status: payload.status,
          startDate: payload.startDate,
          endDate: payload.endDate,
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'milestoneDuplicatedSuccess',
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
    submitDuplicate,
  };
};
