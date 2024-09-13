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

import { MEMBER, MANAGER, VIEWER, EDITOR } from 'common/constants/projectRoles';

export const ALL = 'ALL';
export const OWNER = 'OWNER';

export const ACTIONS = {
  ACCESS_TO_MANAGEMENT_SYSTEM: 'ACCESS_TO_MANAGEMENT_SYSTEM',
  CREATE_PROJECT: 'CREATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  RENAME_PROJECT: 'RENAME_PROJECT',
  CHANGE_ACCESS_PROJECT: 'CHANGE_ACCESS_PROJECT',
  VIEW_INFO_BILLING: 'VIEW_INFO_BILLING',
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
  MAKE_DECISION: 'MAKE_DECISION',
  CHANGE_TEST_ITEM_STATUS: 'CHANGE_TEST_ITEM_STATUS',
  MANAGE_BTS_ISSUES: 'MANAGE_BTS_ISSUES',
  MOVE_TO_DEBUG: 'MOVE_TO_DEBUG',
  MERGE_LAUNCHES: 'MERGE_LAUNCHES',
  WORK_WITH_FILTERS: 'WORK_WITH_FILTERS',
  READ_DATA: 'READ_DATA',
  RESIZE_AND_DRAG_WIDGETS: 'RESIZE_AND_DRAG_WIDGETS',
  SEE_DEMO_DATA: 'SEE_DEMO_DATA',
  WORK_WITH_DEFECT_TYPES: 'WORK_WITH_DEFECT_TYPES',
  WORK_WITH_WIDGETS: 'WORK_WITH_WIDGETS',
  REPORT_LAUNCHES: 'REPORT_LAUNCHES',
  CREATE_ORGANIZATION: 'CREATE_ORGANIZATION',
  DELETE_ORGANIZATION: 'DELETE_ORGANIZATION',
  RENAME_ORGANIZATION: 'RENAME_ORGANIZATION',
  SEE_ORGANIZATION_SETTINGS: 'SEE_ORGANIZATION_SETTINGS',
  SEE_ORGANIZATION_MEMBERS: 'SEE_ORGANIZATION_MEMBERS',
  WORK_WITH_DASHBOARD: 'WORK_WITH_DASHBOARD',
  WORK_WITH_TESTS: 'WORK_WITH_TESTS',
  SEE_EMAIL_MEMBERS: 'SEE_EMAIL_MEMBERS',
  SEE_ROW_ACTION_MENU: 'SEE_ROW_ACTION_MENU',
  ACCESS_INSTANCE_LEVEL_PAGES: 'ACCESS_INSTANCE_LEVEL_PAGES',
  MANAGE_TEST_ITEMS_ACTIONS: 'MANAGE_TEST_ITEMS_ACTIONS',
};

export const PERMISSIONS_MAP = {
  [MANAGER]: {
    [ACTIONS.SEE_SETTINGS]: true,
    [ACTIONS.UPDATE_SETTINGS]: true,
    [ACTIONS.INVITE_INTERNAL_USER]: true,
    [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: true,
    [ACTIONS.SEE_MEMBERS]: true,
    [ACTIONS.CHANGE_USER_ROLE]: true,
    [ACTIONS.REPORT_LAUNCHES]: true,
    [ACTIONS.MOVE_TO_DEBUG]: true,
    [ACTIONS.MERGE_LAUNCHES]: true,
    [ACTIONS.DELETE_LAUNCH]: true,
    [ACTIONS.EDIT_LAUNCH]: true,
    [ACTIONS.FORCE_FINISH_LAUNCH]: true,
    [ACTIONS.START_ANALYSIS]: true,
    [ACTIONS.BULK_EDIT_ITEMS]: true,
    [ACTIONS.FORCE_FINISH_RERUN_LAUNCH]: true,
    [ACTIONS.CHANGE_TEST_ITEM_STATUS]: true,
    [ACTIONS.DELETE_TEST_ITEM]: true,
    [ACTIONS.MAKE_DECISION]: true,
    [ACTIONS.MANAGE_BTS_ISSUES]: true,
    [ACTIONS.WORK_WITH_FILTERS]: true,
    [ACTIONS.WORK_WITH_WIDGETS]: true,
    [ACTIONS.SEE_ORGANIZATION_SETTINGS]: true,
    [ACTIONS.SEE_ORGANIZATION_MEMBERS]: true,
    [ACTIONS.CREATE_PROJECT]: true,
    [ACTIONS.DELETE_PROJECT]: true,
    [ACTIONS.RENAME_PROJECT]: true,
    [ACTIONS.CHANGE_ACCESS_PROJECT]: true,
    [ACTIONS.VIEW_INFO_BILLING]: true,
    [ACTIONS.RENAME_ORGANIZATION]: true,
    [ACTIONS.WORK_WITH_DEFECT_TYPES]: true,
    [ACTIONS.SEE_DEMO_DATA]: true,
    [ACTIONS.WORK_WITH_DASHBOARD]: true,
    [ACTIONS.WORK_WITH_TESTS]: true,
    [ACTIONS.SEE_EMAIL_MEMBERS]: true,
    [ACTIONS.SEE_ROW_ACTION_MENU]: true,
    [ACTIONS.MANAGE_TEST_ITEMS_ACTIONS]: true,
  },
  [MEMBER]: {
    [VIEWER]: {
      [ACTIONS.SEE_SETTINGS]: true,
      [ACTIONS.SEE_MEMBERS]: true,
    },
    [EDITOR]: {
      [ACTIONS.SEE_SETTINGS]: true,
      [ACTIONS.UPDATE_SETTINGS]: true,
      [ACTIONS.INVITE_INTERNAL_USER]: true,
      [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: true,
      [ACTIONS.SEE_MEMBERS]: true,
      [ACTIONS.CHANGE_USER_ROLE]: true,
      [ACTIONS.REPORT_LAUNCHES]: true,
      [ACTIONS.MOVE_TO_DEBUG]: true,
      [ACTIONS.MERGE_LAUNCHES]: true,
      [ACTIONS.DELETE_LAUNCH]: true,
      [ACTIONS.EDIT_LAUNCH]: true,
      [ACTIONS.FORCE_FINISH_LAUNCH]: true,
      [ACTIONS.START_ANALYSIS]: true,
      [ACTIONS.FORCE_FINISH_RERUN_LAUNCH]: true,
      [ACTIONS.BULK_EDIT_ITEMS]: true,
      [ACTIONS.DELETE_TEST_ITEM]: true,
      [ACTIONS.CHANGE_TEST_ITEM_STATUS]: true,
      [ACTIONS.MAKE_DECISION]: true,
      [ACTIONS.MANAGE_BTS_ISSUES]: true,
      [ACTIONS.WORK_WITH_FILTERS]: true,
      [ACTIONS.WORK_WITH_WIDGETS]: true,
      [ACTIONS.RENAME_PROJECT]: true,
      [ACTIONS.WORK_WITH_DEFECT_TYPES]: true,
      [ACTIONS.SEE_DEMO_DATA]: true,
      [ACTIONS.WORK_WITH_DASHBOARD]: true,
      [ACTIONS.WORK_WITH_TESTS]: true,
      [ACTIONS.SEE_ROW_ACTION_MENU]: true,
      [ACTIONS.MANAGE_TEST_ITEMS_ACTIONS]: true,
    },
  },
};
