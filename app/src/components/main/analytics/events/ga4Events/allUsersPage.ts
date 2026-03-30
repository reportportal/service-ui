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

import { getBasicChooseEventParameters, getBasicClickEventParameters } from '../common/ga4Utils';

const ALL_USERS_PAGE = 'all_users';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(ALL_USERS_PAGE);

export const ALL_USERS_PAGE_EVENTS = {
  SEARCH_ALL_USERS_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'search',
  },
  clickApplyFilterButton: (type: string, condition: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'filter_all_users',
    element_name: 'apply',
    condition,
    type,
  }),
  clickProvideRevokeAdminRights: (provide = true, modal = false) => {
    const name = `${provide ? 'provide' : 'revoke'}_admin_rights`;
    const additionalParameters = modal ? { modal: name, element_name: name } : { icon_name: name };

    return {
      ...BASIC_EVENT_PARAMETERS,
      place: 'all_users_page',
      ...additionalParameters,
    };
  },
  SORTING: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    icon_name: 'users_sorting',
  },
  OPEN_DELETE_USER_MODAL: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    icon_name: 'delete',
  },
  DELETE_USER: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'delete',
    modal: 'delete_user',
  },
  BULK_DELETE_USERS: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'start_delete',
  },
  bulkDeleteUsersModal: (count: number) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'submit_delete',
    modal: 'delete_users',
    type: count === 1 ? 'single' : 'multi',
  }),
  export: (appliedFiltersCount = 0) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'export',
    number: appliedFiltersCount,
  }),
  CREATE_USER_MODAL: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'create_user',
  },
  createUser: (adminRights?: boolean) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'create',
    modal: 'create_user',
    condition: adminRights ? 'provide_admin_rights' : 'no_provide_admin_rights',
  }),
  changePageSize: (pageSize: number) => ({
    ...getBasicChooseEventParameters(ALL_USERS_PAGE),
    element_name: 'page_size_control',
    number: pageSize,
    place: 'all_users',
  }),
  inviteUser: (condition = 'without_project') => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: 'invite',
    modal: 'invite_user',
    type: 'instance_level',
    condition,
  }),
  OPEN_MANAGE_ASSIGNMENTS_MODAL: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    icon_name: 'manage_assignments',
  },
  MANAGE_ASSIGNMENTS_DOCUMENTATION: {
    ...BASIC_EVENT_PARAMETERS,
    link_name: 'documentation',
    place: 'manage_assignment',
  },
  manageAssignmentsSave: (condition: string) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users',
    element_name: 'save',
    modal: 'manage_assignment',
    condition,
  }),
};
