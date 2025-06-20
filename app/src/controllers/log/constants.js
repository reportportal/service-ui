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

import * as logLevels from 'common/constants/logLevels';
import { SORTING_ASC } from 'controllers/sorting/constants';
import { formatSortingString } from 'controllers/sorting/utils';

export const NAMESPACE = 'log';
export const LOG_ITEMS_NAMESPACE = `${NAMESPACE}/logItems`;
export const ACTIVITY_NAMESPACE = `${NAMESPACE}/activity`;
export const STACK_TRACE_NAMESPACE = `${NAMESPACE}/stackTrace`;
export const ERROR_LOGS_NAMESPACE = `${NAMESPACE}/errorLogs`;
export const FETCH_LOG_PAGE_DATA = 'fetchLogPageData';
export const FETCH_LOG_PAGE_STACK_TRACE = 'fetchLogPageStackTrace';
export const DEFAULT_HISTORY_DEPTH = 12;
export const HISTORY_DEPTH_LIMIT = 30;
export const DEFAULT_LOG_LEVEL = logLevels.TRACE;
export const LOG_LEVEL_STORAGE_KEY = 'logFilteringLevel';
export const LOG_TIME_FORMAT_STORAGE_KEY = 'logTimeFormat';
export const LOG_LEVEL_FILTER_KEY = 'filter.gte.level';
export const LOG_STATUS_FILTER_KEY = 'filter.in.status';
export const WITH_ATTACHMENTS_FILTER_KEY = 'filter.ex.binaryContent';
export const LOG_VIEW_MODE_STORAGE_KEY = 'logViewMode';
export const FAQ_TOUCHED_STATUS_STORAGE_KEY = 'isFaqTouched';
export const HIDE_PASSED_LOGS = 'excludePassedLogs';
export const HIDE_EMPTY_STEPS = 'excludeEmptySteps';
export const DEFAULT_SORTING = formatSortingString(['logTime'], SORTING_ASC);
export const RETRY_ID = 'retryId';
export const ACTIVE_LOG_ITEM_QUERY_KEY = 'history';
export const CLEAR_LOG_PAGE_STACK_TRACE = 'clearStackTrace';
export const DETAILED_LOG_VIEW = 'DETAILED_LOG_VIEW';
export const LAUNCH_LOG_VIEW = 'LAUNCH_LOG_VIEW';
export const SET_LOG_PAGE_LOADING = 'SET_LOG_PAGE_LOADING';
export const FETCH_HISTORY_ITEMS_SUCCESS = 'FETCH_HISTORY_ITEMS_SUCCESS';
export const UPDATE_HISTORY_ITEM_ISSUES = 'UPDATE_HISTORY_ITEM_ISSUES';
export const UPDATE_HISTORY_ITEM_LAUNCH_ATTRIBUTES = 'UPDATE_HISTORY_ITEM_LAUNCH_ATTRIBUTES';
export const HISTORY_LINE_DEFAULT_VALUE = 'line';
export const HISTORY_LINE_TABLE_MODE = 'table';
export const SET_INCLUDE_ALL_LAUNCHES = 'SET_INCLUDE_ALL_LAUNCHES';
export const SET_SHOULD_SHOW_LOAD_MORE = 'SET_SHOULD_SHOW_LOAD_MORE';
export const FETCH_HISTORY_LINE_ITEMS = 'FETCH_HISTORY_LINE_ITEMS';
export const NUMBER_OF_ITEMS_TO_LOAD = 9;
export const SET_ACTIVE_TAB_ID = 'SET_ACTIVE_TAB_ID';
export const FETCH_HISTORY_ITEMS_WITH_LOADING = 'ON_UPDATE_ITEM_STATUS';
export const FETCH_ERROR_LOGS = 'fetchErrorLogs';
export const FETCH_ERROR_LOG = 'fetchErrorLog';

export const LOG_LEVELS = [
  {
    id: logLevels.FATAL,
    label: 'Fatal',
    trackingName: 'fatal',
  },
  {
    id: logLevels.ERROR,
    label: 'Error',
    trackingName: 'error',
  },
  {
    id: logLevels.WARN,
    label: 'Warn',
    trackingName: 'warn',
  },
  {
    id: logLevels.INFO,
    label: 'Info',
    trackingName: 'info',
  },
  {
    id: logLevels.DEBUG,
    label: 'Debug',
    trackingName: 'debug',
  },
  {
    id: logLevels.TRACE,
    label: 'Trace',
    trackingName: 'trace',
  },
];

export const PREVIOUS = 'previous';
export const NEXT = 'next';
export const ALL = 'all';
export const ERROR_LOG_INDEX_KEY = 'errorLogIndex';
