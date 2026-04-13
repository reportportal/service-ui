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

export const HISTORY_OF_ACTIONS_NAMESPACE = 'historyOfActions';

export const TMS_TEST_CASE_OBJECT_TYPE = 'tmsTestCase';

export const HistoryOfActionsPageDefaultValues = {
  limit: 20,
  offset: 0,
};

export const HISTORY_SEARCH_DEBOUNCE_MS = 300;

export const HISTORY_ACTIVITY_DETAILS_FILTER_KEY = 'filter.cnt.details' as const;
