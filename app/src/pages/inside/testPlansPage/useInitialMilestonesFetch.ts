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

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isUndefined } from 'es-toolkit';

import {
  getMilestonesAction,
  milestonesLoadingSelector,
  milestonesSelector,
  type PaginationOffsetLimit,
} from 'controllers/milestone';
import { isAuthorizedSelector } from 'controllers/auth';

// Fetches milestones once when the page opens without data (the route thunk normally does it).
// A failed request leaves the data empty, so the check must not repeat or it loops on errors.
export const useInitialMilestonesFetch = (queryParams: PaginationOffsetLimit) => {
  const dispatch = useDispatch();
  const milestones = useSelector(milestonesSelector);
  const milestonesLoading = useSelector(milestonesLoadingSelector);
  const isAuthorized = useSelector(isAuthorizedSelector);
  const isCheckedRef = useRef(false);

  useEffect(() => {
    if (isCheckedRef.current || !isAuthorized) {
      return;
    }

    isCheckedRef.current = true;

    if (isUndefined(milestones) && !milestonesLoading) {
      dispatch(getMilestonesAction(queryParams));
    }
  }, [dispatch, milestones, milestonesLoading, queryParams, isAuthorized]);
};
