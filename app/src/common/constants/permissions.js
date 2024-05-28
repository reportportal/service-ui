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
};
export const PERMISSIONS_MAP = {
  [MANAGER]: {
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.UPDATE_SETTINGS]: ALL,
    [ACTIONS.INVITE_INTERNAL_USER]: ALL,
    [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.CHANGE_USER_ROLE]: ALL,
    [ACTIONS.REPORT_LAUNCHES]: ALL,
    [ACTIONS.MOVE_TO_DEBUG]: ALL,
    [ACTIONS.MERGE_LAUNCHES]: ALL,
    [ACTIONS.DELETE_LAUNCH]: ALL,
    [ACTIONS.EDIT_LAUNCH]: ALL,
    [ACTIONS.FORCE_FINISH_LAUNCH]: ALL,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.BULK_EDIT_ITEMS]: ALL,
    [ACTIONS.FORCE_FINISH_RERUN_LAUNCH]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: ALL,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.WORK_WITH_WIDGETS]: ALL,
    [ACTIONS.SEE_ORGANIZATION_SETTINGS]: ALL,
    [ACTIONS.SEE_ORGANIZATION_MEMBERS]: ALL,
    [ACTIONS.CREATE_PROJECT]: ALL,
    [ACTIONS.DELETE_PROJECT]: ALL,
    [ACTIONS.RENAME_PROJECT]: ALL,
    [ACTIONS.CHANGE_ACCESS_PROJECT]: ALL,
    [ACTIONS.VIEW_INFO_BILLING]: ALL,
    [ACTIONS.RENAME_ORGANIZATION]: ALL,
    [ACTIONS.WORK_WITH_DEFECT_TYPES]: ALL,
  },
  [MEMBER]: {
    [VIEWER]: {
      [ACTIONS.SEE_SETTINGS]: ALL,
      [ACTIONS.SEE_MEMBERS]: ALL,
    },
    [EDITOR]: {
      [ACTIONS.SEE_SETTINGS]: ALL,
      [ACTIONS.UPDATE_SETTINGS]: ALL,
      [ACTIONS.INVITE_INTERNAL_USER]: ALL,
      [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: ALL,
      [ACTIONS.SEE_MEMBERS]: ALL,
      [ACTIONS.CHANGE_USER_ROLE]: ALL,
      [ACTIONS.REPORT_LAUNCHES]: ALL,
      [ACTIONS.MOVE_TO_DEBUG]: OWNER,
      [ACTIONS.MERGE_LAUNCHES]: OWNER,
      [ACTIONS.DELETE_LAUNCH]: OWNER,
      [ACTIONS.EDIT_LAUNCH]: OWNER,
      [ACTIONS.FORCE_FINISH_LAUNCH]: OWNER,
      [ACTIONS.START_ANALYSIS]: ALL,
      [ACTIONS.FORCE_FINISH_RERUN_LAUNCH]: ALL,
      [ACTIONS.BULK_EDIT_ITEMS]: OWNER,
      [ACTIONS.DELETE_TEST_ITEM]: OWNER,
      [ACTIONS.WORK_WITH_FILTERS]: ALL,
      [ACTIONS.WORK_WITH_WIDGETS]: ALL,
      [ACTIONS.RENAME_PROJECT]: ALL,
      [ACTIONS.WORK_WITH_DEFECT_TYPES]: ALL,
    },
  },
};
