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

export const NAMESPACE = 'testItem';

export const SET_LEVEL = 'setLevel';
export const FETCH_TEST_ITEMS = 'fetchTestItems';
export const FETCH_TEST_ITEMS_LOG_PAGE = 'fetchTestItemsFromLogPage';
export const FETCH_PARENT_LAUNCH_SUCCESS = 'fetchParentLaunchSuccess';
export const DELETE_TEST_ITEMS = 'DeleteTestItems';
export const SET_PAGE_LOADING = `${NAMESPACE}/setPageLoading`;
export const RESTORE_PATH = 'restorePath';

export const TEST_ITEMS_TYPE_LIST = 'list';
export const PARENT_ITEMS_NAMESPACE = `${NAMESPACE}/parentItems`;
export const FILTERED_ITEM_STATISTICS_NAMESPACE = `${NAMESPACE}/filteredItemStatistics`;
export const DEFAULT_SORTING = formatSortingString(['startTime'], SORTING_ASC);
export const DEFAULT_LAUNCHES_LIMIT = 600;
export const COMPOSITE_ATTRIBUTES_FILTER = 'filter.has.compositeAttribute';
export const LEVEL_ATTRIBUTES_FILTER = 'filter.has.levelAttribute';
export const CURRENT_ITEM_LEVEL = 'currentItemLevel';
export const PROVIDER_TYPE_WIDGET = 'widget';
export const PROVIDER_TYPE_LAUNCH = 'launch';
export const PROVIDER_TYPE_BASELINE = 'baseline';
export const PROVIDER_TYPE_FILTER = 'filter';
export const PROVIDER_TYPE_CLUSTER = 'cluster';
export const PROVIDER_TYPE_WIDGET_ID = 'widgetId';
export const PROVIDER_TYPE_LAUNCH_ID = 'launchId';
export const PROVIDER_TYPE_FILTER_ID = 'filterId';
export const SEARCH_TEST_ITEMS = 'searchTestItemsFromWidget';
export const REFRESH_SEARCHED_ITEMS = 'refreshSearchedItems';
export const LOAD_MORE_SEARCHED_ITEMS = 'loadMoreItems';
export const SEARCHED_ITEMS_WIDGET = 'searchedItemsWidget';

export const LIST_VIEW = 'LIST_VIEW';
export const LOG_VIEW = 'PARENT_LOG_VIEW';
export const HISTORY_VIEW = 'HISTORY_VIEW';
export const UNIQUE_ERRORS_VIEW = 'UNIQUE_ERRORS_VIEW';

export const FILTERED_ITEM_STATISTICS_INITIAL_STATE = {
  executions: {},
  defects: {},
};

export const PROVIDER_TYPE_MODIFIERS_ID_MAP = {
  [PROVIDER_TYPE_WIDGET]: PROVIDER_TYPE_WIDGET_ID,
  [PROVIDER_TYPE_LAUNCH]: PROVIDER_TYPE_LAUNCH_ID,
  [PROVIDER_TYPE_FILTER]: PROVIDER_TYPE_FILTER_ID,
};

export const TEST_ITEM_TYPES_MAP = {
  [LEVEL_SUITE]: LEVEL_SUITE,
  [LEVEL_STORY]: LEVEL_SUITE,
  [LEVEL_TEST]: LEVEL_TEST,
  [LEVEL_SCENARIO]: LEVEL_TEST,
};
