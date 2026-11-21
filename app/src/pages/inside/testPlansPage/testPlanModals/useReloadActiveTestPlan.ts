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
import { useDispatch, useStore } from 'react-redux';

import { getTestPlanAction } from 'controllers/testPlan';
import { getTestPlanDetailsFetchParams } from 'controllers/testPlan/fetchParams';

// Reloads the open test plan (header, folders and the current page of the current folder) after a
// mutation, keeping the list in line with the URL and the pager. Does nothing on other pages.
export const useReloadActiveTestPlan = () => {
  const dispatch = useDispatch();
  const store = useStore();

  return useCallback(() => {
    const params = getTestPlanDetailsFetchParams(
      store.getState() as Parameters<typeof getTestPlanDetailsFetchParams>[0],
    );

    if (params) {
      dispatch(getTestPlanAction({ ...params, forceReloadPlan: true }));
    }
  }, [dispatch, store]);
};
