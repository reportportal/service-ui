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

import { formatSortingString, SORTING_ASC } from 'controllers/sorting';
import {
  LEVEL_SUITE,
  LEVEL_TEST,
  LEVEL_STORY,
  LEVEL_SCENARIO,
} from 'common/constants/launchLevels';

export const SET_LEVEL = 'setLevel';
export const FETCH_TEST_ITEMS = 'fetchTestItems';
export const FETCH_TEST_ITEMS_LOG_PAGE = 'fetchTestItemsFromLogPage';
export const TEST_ITEMS_TYPE_LIST = 'list';
export const RESTORE_PATH = 'restorePath';
export const NAMESPACE = 'testItem';
export const PARENT_ITEMS_NAMESPACE = `${NAMESPACE}/parentItems`;
export const FILTERED_ITEM_STATISTICS_NAMESPACE = `${NAMESPACE}/filteredItemStatistics`;
export const SET_PAGE_LOADING = `${NAMESPACE}/setPageLoading`;
export const DEFAULT_SORTING = formatSortingString(['startTime'], SORTING_ASC);
export const LIST_VIEW = 'LIST_VIEW';
export const LOG_VIEW = 'LOG_VIEW';
export const DEFAULT_LAUNCHES_LIMIT = 600;
export const DELETE_TEST_ITEMS = 'DeleteTestItems';
export const COMPOSITE_ATTRIBUTES_FILTER = 'filter.has.compositeAttribute';

export const FILTERED_ITEM_STATISTICS_INITIAL_STATE = {
  executions: {},
  defects: {},
};

export const TEST_ITEM_TYPES_MAP = {
  [LEVEL_SUITE]: LEVEL_SUITE,
  [LEVEL_STORY]: LEVEL_SUITE,
  [LEVEL_TEST]: LEVEL_TEST,
  [LEVEL_SCENARIO]: LEVEL_TEST,
};
