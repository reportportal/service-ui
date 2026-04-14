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

import { fetch } from 'common/utils';
import { useDebouncedSpinner, useQueryParams } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import {
  defaultMilestoneQueryParams,
  getMilestonesAction,
  type TmsMilestoneRS,
} from 'controllers/milestone';

import type { ChangeMilestoneStatusSuccessMessageId, MilestoneStatusPatchBody } from './types';

type UseChangeMilestoneStatusParams = {
  milestoneId: TmsMilestoneRS['id'];
};

export const useChangeMilestoneStatus = ({ milestoneId }: UseChangeMilestoneStatusParams) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const queryParams = useQueryParams(defaultMilestoneQueryParams);

  const updateMilestone = async (
    body: MilestoneStatusPatchBody,
    successMessageId: ChangeMilestoneStatusSuccessMessageId,
  ) => {
    if (milestoneId) {
      try {
        showSpinner();

        await fetch<TmsMilestoneRS>(URLS.tmsMilestoneById(projectKey, milestoneId), {
          method: 'patch',
          data: body,
        });

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
    }
  };

  return {
    isLoading,
    updateMilestone,
  };
};
