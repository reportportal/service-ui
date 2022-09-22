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

import { PROJECT_MANAGER, MEMBER } from 'common/constants/projectRoles';

export const ALL = 'ALL';
export const OWNER = 'OWNER';

export const ACTIONS = {
  ACCESS_TO_MANAGEMENT_SYSTEM: 'ACCESS_TO_MANAGEMENT_SYSTEM',
  CREATE_PROJECT: 'CREATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SEE_SETTINGS: 'SEE_SETTINGS',
  CREATE_INTERNAL_USER: 'CREATE_INTERNAL_USER',
  INVITE_INTERNAL_USER: 'INVITE_INTERNAL_USER',
  ASSIGN_UNASSIGN_INTERNAL_USER: 'ASSIGN_UNASSIGN_INTERNAL_USER',
  CHANGE_USER_ROLE: 'CHANGE_USER_ROLE',
  DELETE_USER: 'DELETE_USER',
  SEE_MEMBERS: 'SEE_MEMBERS',
  EDIT_OWN_ACCOUNT: 'EDIT_OWN_ACCOUNT',
  DELETE_LAUNCH: 'DELETE_LAUNCH',
  EDIT_LAUNCH: 'EDIT_LAUNCH',
  BULK_EDIT_ITEMS: 'BULK_EDIT_ITEMS',
  FORCE_FINISH_LAUNCH: 'FORCE_FINISH_LAUNCH',
  FORCE_FINISH_RERUN_LAUNCH: 'FORCE_FINISH_RERUN_LAUNCH',
  START_ANALYSIS: 'START_ANALYSIS',
  DELETE_TEST_ITEM: 'DELETE_TEST_ITEM',
  MOVE_TO_DEBUG: 'MOVE_TO_DEBUG',
  MERGE_LAUNCHES: 'MERGE_LAUNCHES',
  WORK_WITH_FILTERS: 'WORK_WITH_FILTERS',
  READ_DATA: 'READ_DATA',
  RESIZE_AND_DRAG_WIDGETS: 'RESIZE_AND_DRAG_WIDGETS',
  ADD_WIDGET: 'ADD_WIDGET',
  EDIT_WIDGET: 'EDIT_WIDGET',
  DELETE_WIDGET: 'DELETE_WIDGET',
  EDIT_DASHBOARD: 'EDIT_DASHBOARD',
  DELETE_DASHBOARD: 'DELETE_DASHBOARD',
  DELETE_FILTER: 'DELETE_FILTER',
  EDIT_FILTER: 'EDIT_FILTER',
  SEE_DEMO_DATA: 'SEE_DEMO_DATA',
};
export const PERMISSIONS_MAP = {
  [PROJECT_MANAGER]: {
    [ACTIONS.UPDATE_SETTINGS]: ALL,
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.INVITE_INTERNAL_USER]: ALL,
    [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: ALL,
    [ACTIONS.CHANGE_USER_ROLE]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.DELETE_LAUNCH]: ALL,
    [ACTIONS.EDIT_LAUNCH]: ALL,
    [ACTIONS.BULK_EDIT_ITEMS]: ALL,
    [ACTIONS.FORCE_FINISH_LAUNCH]: ALL,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: ALL,
    [ACTIONS.MOVE_TO_DEBUG]: ALL,
    [ACTIONS.MERGE_LAUNCHES]: ALL,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
    [ACTIONS.RESIZE_AND_DRAG_WIDGETS]: ALL,
    [ACTIONS.ADD_WIDGET]: ALL,
    [ACTIONS.EDIT_WIDGET]: ALL,
    [ACTIONS.DELETE_WIDGET]: ALL,
    [ACTIONS.EDIT_DASHBOARD]: ALL,
    [ACTIONS.DELETE_DASHBOARD]: ALL,
    [ACTIONS.DELETE_FILTER]: ALL,
    [ACTIONS.EDIT_FILTER]: ALL,
    [ACTIONS.SEE_DEMO_DATA]: ALL,
  },
  [MEMBER]: {
    [ACTIONS.UPDATE_SETTINGS]: ALL,
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.INVITE_INTERNAL_USER]: ALL,
    [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: ALL,
    [ACTIONS.CHANGE_USER_ROLE]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.DELETE_LAUNCH]: ALL,
    [ACTIONS.EDIT_LAUNCH]: ALL,
    [ACTIONS.BULK_EDIT_ITEMS]: ALL,
    [ACTIONS.FORCE_FINISH_LAUNCH]: ALL,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: ALL,
    [ACTIONS.MOVE_TO_DEBUG]: ALL,
    [ACTIONS.MERGE_LAUNCHES]: ALL,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
    [ACTIONS.RESIZE_AND_DRAG_WIDGETS]: ALL,
    [ACTIONS.ADD_WIDGET]: ALL,
    [ACTIONS.EDIT_WIDGET]: ALL,
    [ACTIONS.DELETE_WIDGET]: ALL,
    [ACTIONS.EDIT_DASHBOARD]: ALL,
    [ACTIONS.DELETE_DASHBOARD]: ALL,
    [ACTIONS.DELETE_FILTER]: ALL,
    [ACTIONS.EDIT_FILTER]: ALL,
    [ACTIONS.SEE_DEMO_DATA]: ALL,
  },
};
