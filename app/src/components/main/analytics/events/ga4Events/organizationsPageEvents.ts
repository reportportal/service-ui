/*
 * Copyright 2024 EPAM Systems
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

import { getBasicChooseEventParameters, getBasicClickEventParameters } from '../common/ga4Utils';

const ORGANIZATION_PAGE = 'organization';
const SETTINGS_PAGE = 'organization_settings';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(ORGANIZATION_PAGE);
const SETTINGS_EVENT_PARAMETERS = getBasicClickEventParameters(SETTINGS_PAGE);

export const ORGANIZATION_PAGE_EVENTS = {
  SEARCH_ORGANIZATION_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: 'search',
  },
  SEARCH_ORGANIZATION_USERS_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: 'search',
  },
  clickApplyFilterButton: (type: string, condition: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'filter_organization',
    element_name: 'apply',
    condition,
    type,
  }),
  organizationsSorting: (type: string, arrow = false) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: `organizations_sorting${arrow ? '_arrow' : ''}`,
    type,
  }),
  export: (appliedFiltersCount = 0) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: 'export',
    number: appliedFiltersCount,
  }),
  meatballMenu: (elementName: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: elementName,
  }),
  activityPage: (page: string, organizationId: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    action: 'page_view',
    organization_id: organizationId,
    place: page,
  }),
  viewOrganizationSettings: (page: string) => ({
    action: 'page_view',
    place: `organization_settings_${page}`,
  }),
  VIEW_ORGANIZATION_USERS: {
    action: 'page_view',
    place: 'organization_users',
  },
  updateOrganizationSettings: ({ keepLaunches, keepLogs, keepScreenshots }) => ({
    ...SETTINGS_EVENT_PARAMETERS,
    place: 'general',
    element_name: 'button_submit',
    type: `${keepLaunches}#${keepLogs}#${keepScreenshots}`,
  }),
  inviteUser: (withProject = false) => ({
    ...BASIC_EVENT_PARAMETERS,
    element_name: 'invite',
    modal: 'invite_user',
    type: 'organization_level',
    condition: `${withProject ? 'with' : 'without'}_project`,
  }),
  CLICK_APPLY_BUTTON: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    modal: 'filter_activity',
    element_name: 'apply',
  },
  SEARCH_ACTIVITY_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'activity',
    element_name: 'search',
  },
  meatballMenuUsers: (elementName: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: elementName,
  }),
  manageAssignments: (elementName: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: elementName,
    modal: 'manage_assignments_of_user',
  }),
  unassignUser: (isCurrentUser: boolean) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: 'unassign',
    modal: `unassign${isCurrentUser ? '' : '_user'}_from_organization`,
  }),
  UNASSIGN_SELF: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: 'unassign',
  },
  CLICK_CREATE_ORGANIZATION: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: 'create_organization',
  },
  CLICK_CREATE_BUTTON: {
    ...BASIC_EVENT_PARAMETERS,
    element_name: 'create',
    modal: 'create_organization',
    place: 'all_organizations',
  },
  HOVER_CREATE_BUTTON: {
    ...BASIC_EVENT_PARAMETERS,
    action: 'tooltip_view',
    element_name: 'tooltip_create_organization',
    place: 'all_organizations',
  },
  DELETE_ORGANIZATION: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_organizations',
    element_name: 'delete',
    modal: 'delete_organization',
  },
  getChangePageSizeEvent: (place: string) => (pageSize: number) => ({
    ...getBasicChooseEventParameters(ORGANIZATION_PAGE),
    element_name: 'page_size_control',
    number: pageSize,
    place,
  }),
};
