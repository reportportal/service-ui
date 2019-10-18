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

import { formatSortingString, SORTING_DESC } from 'controllers/sorting';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';

export const FETCH_LAUNCHES = 'fetchLaunchesAction';
export const SET_DEBUG_MODE = 'setDebugMode';
export const CHANGE_LAUNCH_DISTINCT = 'changeLaunchDistinct';
export const FETCH_LAUNCHES_WITH_PARAMS = 'fetchLaunchesWithParamsAction';
export const FETCH_LAUNCHES_PAGE_DATA = 'fetchLaunchesPageData';
export const UPDATE_LAUNCH_LOCALLY = 'updateLaunchLocally';
export const UPDATE_LAUNCHES_LOCALLY = 'updateLaunchesLocally';

export const NAMESPACE = 'launches';

export const DEFAULT_SORTING = formatSortingString([ENTITY_START_TIME, 'number'], SORTING_DESC);
export const DEFAULT_LOCAL_SORTING = {
  sortingColumn: ENTITY_START_TIME,
  sortingDirection: SORTING_DESC,
};

export const UPDATE_LOCAL_SORTING = 'updateLocalSorting';
export const UPDATE_DEBUG_LOCAL_SORTING = 'updateDebugLocalSorting';
export const UPDATE_DEBUG_LOCAL_FILTER = 'updateDebugLocalFilter';
