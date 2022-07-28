/*
 * Copyright 2022 EPAM Systems
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

const PROJECT_SETTINGS = 'project_settings';
const ANALYZER = 'analyzer';
const BASIC_EVENT_PARAMETERS = {
  action: 'click',
  category: PROJECT_SETTINGS,
  element_name: 'button_submit',
};

const getStatus = (status) => (status ? 'active' : 'disabled');

export const PROJECT_SETTINGS_ANALYZER_EVENTS = {
  CLICK_SUBMIT_IN_INDEX_TAB: (number, status) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_index_settings`,
    number,
    status: getStatus(status),
  }),

  CLICK_SUBMIT_IN_AUTO_ANALYZER_TAB: (number, status, type) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_auto_analyzer`,
    number,
    status: getStatus(status),
    type,
  }),

  CLICK_SUBMIT_IN_SIMILAR_ITEMS_TAB: (number) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_similar_items`,
    number,
  }),

  CLICK_SUBMIT_IN_UNIQUE_ERRORS_TAB: (status) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: `${ANALYZER}_unique_errors`,
    status: getStatus(status),
  }),
};
