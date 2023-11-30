/*
 * Copyright 2021 EPAM Systems
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

export const MAKE_DECISION_MODAL = 'makeDecisionModal';
export const SELECT_DEFECT_MANUALLY = 'selectDefectTypeManually';
export const COPY_FROM_HISTORY_LINE = 'copyFromHistoryLine';
export const MACHINE_LEARNING_SUGGESTIONS = 'machineLearningSuggestions';
export const CURRENT_EXECUTION_ONLY = 'currentExecutionOnly';
export const CURRENT_LAUNCH = 'currentLaunch';
export const LAST_TEN_LAUNCHES = 'launchName';
export const WITH_FILTER = 'filter';
export const ALL_LOADED_TI_FROM_HISTORY_LINE = 'allLoadedTIFromHistoryLine';
export const ERROR_LOGS_SIZE = 5;
export const SAME = 100;
export const HIGH = 70;
export const LOW = 40;
export const RADIO_TEST_ITEM_DETAILS = 'radioTestItemDetails';
export const CHECKBOX_TEST_ITEM_DETAILS = 'checkboxTestItemDetails';
export const DEFAULT_TEST_ITEM_DETAILS = 'defaultTestItemDetails';
export const CLEAR_FOR_ALL = 'clearForAll';
export const NOT_CHANGED_FOR_ALL = 'notChangedForAll';
export const ADD_FOR_ALL = 'addForAll';
export const REPLACE_FOR_ALL = 'replaceForAll';

export const SEARCH_MODES = {
  CURRENT_LAUNCH,
  LAST_TEN_LAUNCHES,
  WITH_FILTER,
};

export const ACTIVE_TAB_MAP = {
  [SELECT_DEFECT_MANUALLY]: 'selectManualChoice',
  [COPY_FROM_HISTORY_LINE]: 'historyChoice',
  [MACHINE_LEARNING_SUGGESTIONS]: 'suggestChoice',
};

export const ACTIVE_TAB_TO_ANALYTICS_DATA_MAP = {
  [SELECT_DEFECT_MANUALLY]: 'defect_type_manually',
  [COPY_FROM_HISTORY_LINE]: 'history_line',
  [MACHINE_LEARNING_SUGGESTIONS]: 'ml_suggestions',
};

export const SHOW_LOGS_BY_DEFAULT = false;
