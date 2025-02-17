/*
 * Copyright 2025 EPAM Systems
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

import { getBasicClickEventParameters } from '../common/ga4Utils';

const PROJECTS_PAGE = 'project_page';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(PROJECTS_PAGE);

export const PROJECTS_PAGE_EVENTS = {
  SEARCH_PROJECTS_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'projects',
    element_name: 'search',
  },
  clickApplyFilterButton: (type, condition) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'filter_project_page',
    element_name: 'apply',
    condition,
    type,
  }),
};
