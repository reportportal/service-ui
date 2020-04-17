/*
 * Copyright 2019 EPAM Systems
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

import { createSelector } from 'reselect';
import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';
import { activeProjectSelector } from 'controllers/user';
import {
  createQueryParametersSelector,
  pagePropertiesSelector,
  payloadSelector,
  pageSelector,
  PROJECT_LAUNCHES_PAGE,
} from 'controllers/pages';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import { DEFAULT_SORTING, NAMESPACE } from './constants';

const domainSelector = (state) => state.launches || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedLaunchesSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const launchesSelector = (state) => domainSelector(state).launches;
export const launchPaginationSelector = (state) => domainSelector(state).pagination;

export const loadingSelector = (state) => domainSelector(state).loading || false;

export const queryParametersSelector = createQueryParametersSelector({
  namespace: NAMESPACE,
  defaultSorting: DEFAULT_SORTING,
});

export const debugModeSelector = (state) => domainSelector(state).debugMode || false;
export const launchDistinctSelector = (state) => domainSelector(state).launchDistinct || ALL;

const createLaunchesLinkSelector = (filterId) =>
  createSelector(pageSelector, payloadSelector, pagePropertiesSelector, (page, payload, query) => ({
    type: page,
    payload: {
      ...payload,
      filterId,
    },
    meta: {
      query,
    },
  }));

export const launchesDistinctLinksSelectorsMap = {
  [ALL]: createLaunchesLinkSelector(ALL),
  [LATEST]: createLaunchesLinkSelector(LATEST),
};

export const getLaunchFilterLinkSelector = createSelector(
  activeProjectSelector,
  launchDistinctSelector,
  (projectId, allLatest) => (filter, active) => {
    const filterId = active ? allLatest : filter;

    return {
      type: PROJECT_LAUNCHES_PAGE,
      payload: {
        projectId,
        filterId,
      },
    };
  },
);

export const localSortingSelector = (state) => domainSelector(state).localSorting;
export const debugLocalSortingSelector = (state) => domainSelector(state).debugLocalSorting;
export const debugLocalFilterSelector = (state) => domainSelector(state).debugLocalFilter;
