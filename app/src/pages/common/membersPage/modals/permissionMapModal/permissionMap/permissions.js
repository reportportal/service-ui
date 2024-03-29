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

import { PROJECT_MANAGER, OPERATOR, CUSTOMER, MEMBER } from 'common/constants/projectRoles';
import { ALL, OWNER } from 'common/constants/permissions';

export const ACTIONS = {
  EDIT_SETTINGS: 'EDIT_SETTINGS',
  ACTIONS_WITH_MEMBERS: 'ACTIONS_WITH_MEMBERS',
  VIEW_INFO_ABOUT_MEMBERS: 'VIEW_INFO_ABOUT_MEMBERS',
  REPORT_LAUNCH: 'REPORT_LAUNCH',
  VIEW_LAUNCH_IN_DEBUG_MODE: 'VIEW_LAUNCH_IN_DEBUG_MODE',
  MOVE_LAUNCH_TO_DEBUG_DEFAULT: 'MOVE_LAUNCH_TO_DEBUG_DEFAULT',
  ACTIONS_WITH_LAUNCH: 'ACTIONS_WITH_LAUNCH',
  MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT: 'MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT',
  ACTIONS_WITH_ITEM: 'ACTIONS_WITH_ITEM',
  INVESTIGATION_ACTIONS: 'INVESTIGATION_ACTIONS',
  CREATE_ITEM: 'CREATE_ITEM',
  EDIT_DELETE_ITEM: 'EDIT_DELETE_ITEM',
  RERUN_LAUNCHES: 'RERUN_LAUNCHES',
  CHANGE_STATUS: 'CHANGE_STATUS',
};

export const PERMISSIONS_MAP = {
  [PROJECT_MANAGER]: {
    [ACTIONS.EDIT_SETTINGS]: OWNER,
    [ACTIONS.ACTIONS_WITH_MEMBERS]: OWNER,
    [ACTIONS.VIEW_INFO_ABOUT_MEMBERS]: OWNER,
    [ACTIONS.REPORT_LAUNCH]: OWNER,
    [ACTIONS.VIEW_LAUNCH_IN_DEBUG_MODE]: ALL,
    [ACTIONS.MOVE_LAUNCH_TO_DEBUG_DEFAULT]: ALL,
    [ACTIONS.ACTIONS_WITH_LAUNCH]: ALL,
    [ACTIONS.MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT]: ALL,
    [ACTIONS.ACTIONS_WITH_ITEM]: ALL,
    [ACTIONS.INVESTIGATION_ACTIONS]: ALL,
    [ACTIONS.CREATE_ITEM]: OWNER,
    [ACTIONS.RERUN_LAUNCHES]: ALL,
    [ACTIONS.CHANGE_STATUS]: ALL,
    [ACTIONS.EDIT_DELETE_ITEM]: ALL,
  },
  [MEMBER]: {
    [ACTIONS.VIEW_INFO_ABOUT_MEMBERS]: OWNER,
    [ACTIONS.REPORT_LAUNCH]: OWNER,
    [ACTIONS.VIEW_LAUNCH_IN_DEBUG_MODE]: ALL,
    [ACTIONS.MOVE_LAUNCH_TO_DEBUG_DEFAULT]: OWNER,
    [ACTIONS.ACTIONS_WITH_LAUNCH]: OWNER,
    [ACTIONS.MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT]: ALL,
    [ACTIONS.ACTIONS_WITH_ITEM]: OWNER,
    [ACTIONS.INVESTIGATION_ACTIONS]: ALL,
    [ACTIONS.CREATE_ITEM]: OWNER,
    [ACTIONS.RERUN_LAUNCHES]: ALL,
    [ACTIONS.CHANGE_STATUS]: ALL,
    [ACTIONS.EDIT_DELETE_ITEM]: ALL,
  },
  [OPERATOR]: {
    [ACTIONS.VIEW_INFO_ABOUT_MEMBERS]: OWNER,
    [ACTIONS.VIEW_LAUNCH_IN_DEBUG_MODE]: ALL,
    [ACTIONS.MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT]: ALL,
    [ACTIONS.INVESTIGATION_ACTIONS]: ALL,
    [ACTIONS.CREATE_ITEM]: OWNER,
    [ACTIONS.CHANGE_STATUS]: ALL,
    [ACTIONS.EDIT_DELETE_ITEM]: ALL,
  },
  [CUSTOMER]: {
    [ACTIONS.REPORT_LAUNCH]: OWNER,
    [ACTIONS.ACTIONS_WITH_LAUNCH]: OWNER,
    [ACTIONS.MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT]: ALL,
    [ACTIONS.ACTIONS_WITH_ITEM]: OWNER,
    [ACTIONS.INVESTIGATION_ACTIONS]: ALL,
    [ACTIONS.CREATE_ITEM]: OWNER,
    [ACTIONS.RERUN_LAUNCHES]: ALL,
    [ACTIONS.CHANGE_STATUS]: ALL,
    [ACTIONS.EDIT_DELETE_ITEM]: ALL,
  },
};
