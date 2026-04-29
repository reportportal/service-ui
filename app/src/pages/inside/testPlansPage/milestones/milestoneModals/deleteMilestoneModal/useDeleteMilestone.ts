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

import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'redux-first-router';
import { useTracking } from 'react-tracking';

import { MILESTONES_PAGE_EVENTS } from 'analyticsEvents/milestonesPageEvents';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useQueryParams } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  defaultMilestoneQueryParams,
  getMilestonesAction,
  milestonesPageSelector,
  milestonesSelector,
} from 'controllers/milestone';
import { useProjectDetails } from 'hooks/useTypedSelector';

export const useDeleteMilestone = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const deleteInFlightRef = useRef(false);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectKey = useSelector(projectKeySelector);
  const { organizationSlug, projectSlug } = useProjectDetails();
  const milestonesPageData = useSelector(milestonesPageSelector);
  const milestones = useSelector(milestonesSelector);
  const queryParams = useQueryParams(defaultMilestoneQueryParams);

  const deleteMilestone = async (milestoneId: number) => {
    if (deleteInFlightRef.current) {
      return;
    }
    deleteInFlightRef.current = true;

    try {
      showSpinner();

      await fetch(URLS.tmsMilestoneById(projectKey, milestoneId), {
        method: 'delete',
      });

      dispatch(hideModalAction());
      trackEvent(MILESTONES_PAGE_EVENTS.SUBMIT_DELETE_MILESTONE);
      dispatch(
        showSuccessNotification({
          messageId: 'milestoneDeletedSuccess',
        }),
      );

      const isSingleItemOnTheLastPage =
        milestonesPageData?.number === milestonesPageData?.totalPages && milestones?.length === 1;

      if (isSingleItemOnTheLastPage) {
        const offset = Number(queryParams.offset) - Number(queryParams.limit);
        const url = `/organizations/${organizationSlug}/projects/${projectSlug}/milestones?offset=${Math.max(0, offset)}&limit=${queryParams.limit}`;

        push(url);
      } else {
        dispatch(getMilestonesAction(queryParams));
      }
    } catch {
      dispatch(
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        }),
      );
    } finally {
      hideSpinner();
      deleteInFlightRef.current = false;
    }
  };

  return {
    isLoading,
    deleteMilestone,
  };
};
