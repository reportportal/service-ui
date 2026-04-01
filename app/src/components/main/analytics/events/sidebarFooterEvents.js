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

import { normalizeEventString } from '../utils';
import { getBasicClickEventParameters, getBasicSearchEventParameters } from './common/ga4Utils';

const SIDEBAR = 'sidebar';

export const SIDEBAR_EVENTS = {
  // GA4 events
  CLICK_OPEN_ORGANIZATION_PROJECTS_BTN: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'hover',
    icon_name: 'open_project_page',
  },
  CLICK_ALL_ORGANIZATION_PROJECTS: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'popover',
    element_name: 'all_organization',
  },
  CLICK_PROJECT_NAME: {
    ...getBasicClickEventParameters(SIDEBAR),
    place: 'hover',
    element_name: 'project_name',
  },
  CLICK_PRIVACY_POLICY_LINK: {
    ...getBasicClickEventParameters(SIDEBAR),
    icon_name: 'privacy_policy',
  },
  SEARCH_ORGANIZATION_PROJECTS: {
    ...getBasicSearchEventParameters(SIDEBAR),
    element_name: 'search',
  },
  onClickLevelHigher: (level) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    element_name: level === 'project' ? 'organization_name' : 'all_organizations',
  }),
  onClickUpdateLink: (type) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    element_name: 'update',
    type: normalizeEventString(type),
  }),
  onClickItem: ({ itemName, isSidebarCollapsed }) => ({
    ...getBasicClickEventParameters(SIDEBAR),
    icon_name: normalizeEventString(itemName),
    place: isSidebarCollapsed ? 'sidebar' : 'sidebar_hover',
  }),
};
