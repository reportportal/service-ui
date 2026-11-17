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

import { getBasicClickEventParameters } from './common/ga4Utils';

export const ADMIN_PROJECTS_PAGE = 'Projects page';
export const ADMINISTRATE = 'administrate';

const basicAdminProjectsClickEventParams = getBasicClickEventParameters(ADMINISTRATE);

export const ADMIN_PROJECTS_PAGE_EVENTS = {
  // GA4 events
  PROJECT_MENU: {
    ...basicAdminProjectsClickEventParams,
    icon_name: 'dots_menu_button',
    place: 'all_projects',
  },
  CLICK_EVENT_MONITORING: {
    ...basicAdminProjectsClickEventParams,
    element_name: 'monitoring',
    place: 'drop_down',
  },
  HEADER_BUTTON_CLICK(section) {
    const baseElementName = 'button_project_';
    const sectionToElementNameMap = {
      monitoring: `${baseElementName}${section}`,
      members: `${baseElementName}${section}`,
      settings: `${baseElementName}${section}`,
    };

    return {
      ...basicAdminProjectsClickEventParams,
      element_name: sectionToElementNameMap[section],
    };
  },
};
