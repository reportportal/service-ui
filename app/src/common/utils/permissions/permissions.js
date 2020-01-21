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

import { PERMISSIONS_MAP, ACTIONS, ALL, OWNER } from 'common/constants/permissions';
import { ADMINISTRATOR } from 'common/constants/accountRoles';

export const createCheckPermission = (permissionMap) => (permission) => (
  userRole,
  projectRole,
  isOwner,
) => {
  if (userRole === ADMINISTRATOR) {
    return true;
  }
  if (permissionMap[projectRole]) {
    const userPermission = permissionMap[projectRole][permission];
    if (userPermission) {
      if (isOwner) {
        return userPermission === ALL || userPermission === OWNER;
      }
      return userPermission === ALL;
    }
    return false;
  }
  return false;
};
const checkPermission = createCheckPermission(PERMISSIONS_MAP);

export const hasAccessToManagementSystem = checkPermission(ACTIONS.ACCESS_TO_MANAGEMENT_SYSTEM);
export const canCreateProject = checkPermission(ACTIONS.CREATE_PROJECT);
export const canDeleteProject = checkPermission(ACTIONS.DELETE_PROJECT);
export const canUpdateSettings = checkPermission(ACTIONS.UPDATE_SETTINGS);
export const canSeeSettings = checkPermission(ACTIONS.SEE_SETTINGS);
export const canCreateInternalUser = checkPermission(ACTIONS.CREATE_INTERNAL_USER);
export const canInviteInternalUser = checkPermission(ACTIONS.INVITE_INTERNAL_USER);
export const canAssignUnassignInternalUser = checkPermission(ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER);
export const canChangeUserRole = checkPermission(ACTIONS.CHANGE_USER_ROLE);
export const canDeleteUser = checkPermission(ACTIONS.DELETE_USER);
export const canSeeMembers = checkPermission(ACTIONS.SEE_MEMBERS);
export const canEditOwnAccount = checkPermission(ACTIONS.EDIT_OWN_ACCOUNT);
export const canDeleteLaunch = checkPermission(ACTIONS.DELETE_LAUNCH);
export const canEditLaunch = checkPermission(ACTIONS.EDIT_LAUNCH); // requires userRole, projectRole, isOwner.
export const canBulkEditItems = checkPermission(ACTIONS.BULK_EDIT_ITEMS);
export const canForceFinishLaunch = checkPermission(ACTIONS.FORCE_FINISH_LAUNCH);
export const canStartAnalysis = checkPermission(ACTIONS.START_ANALYSIS);
export const canDeleteTestItem = checkPermission(ACTIONS.DELETE_TEST_ITEM);
export const canMoveToDebug = checkPermission(ACTIONS.MOVE_TO_DEBUG);
export const canMergeLaunches = checkPermission(ACTIONS.MERGE_LAUNCHES);
export const canWorkWithFilters = checkPermission(ACTIONS.WORK_WITH_FILTERS);
export const canReadData = checkPermission(ACTIONS.READ_DATA);
export const canResizeAndDragWidgets = checkPermission(ACTIONS.RESIZE_AND_DRAG_WIDGETS);
export const canDeleteWidget = checkPermission(ACTIONS.DELETE_WIDGET);
export const canDeleteDashboard = checkPermission(ACTIONS.DELETE_DASHBOARD);
export const canDeleteFilter = checkPermission(ACTIONS.DELETE_FILTER);
export const canEditFilter = checkPermission(ACTIONS.EDIT_FILTER);
export const canSeeDemoData = checkPermission(ACTIONS.SEE_DEMO_DATA);
export const canAddWidget = checkPermission(ACTIONS.ADD_WIDGET);
export const canEditDashboard = checkPermission(ACTIONS.EDIT_DASHBOARD);
export const canEditWidget = checkPermission(ACTIONS.EDIT_WIDGET);
