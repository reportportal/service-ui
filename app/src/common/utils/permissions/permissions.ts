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

import { PERMISSIONS_MAP, ACTIONS } from 'common/constants/permissions';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { MANAGER } from 'common/constants/projectRoles';
import { UserRoles, OrganizationRoles, ProjectRoles, PermissionsMap } from '../../../types/roles';

export const createCheckPermission =
  (permissionMap: PermissionsMap) =>
  (permission: string) =>
  ({
    userRole,
    organizationRole,
    projectRole,
  }: {
    userRole: UserRoles;
    organizationRole: OrganizationRoles;
    projectRole: ProjectRoles;
  }) => {
    if (userRole === ADMINISTRATOR) {
      return true;
    }

    if (organizationRole === MANAGER) {
      return !!permissionMap[organizationRole][permission];
    }

    if (permissionMap[organizationRole]?.[projectRole]) {
      return !!permissionMap[organizationRole][projectRole][permission];
    }

    return false;
  };

const checkPermission = createCheckPermission(PERMISSIONS_MAP);

export const canEditOwnAccount = checkPermission(ACTIONS.EDIT_OWN_ACCOUNT);
export const canManageOrganizations = checkPermission(ACTIONS.MANAGE_ORGANIZATIONS);
export const canManageBTSIssues = checkPermission(ACTIONS.MANAGE_BTS_ISSUES);
export const canManageLaunches = checkPermission(ACTIONS.MANAGE_LAUNCHES);
export const canManageManualLaunches = checkPermission(ACTIONS.MANAGE_MANUAL_LAUNCHES);
export const canManageProjects = checkPermission(ACTIONS.MANAGE_PROJECTS);
export const canManageTestCases = checkPermission(ACTIONS.MANAGE_TEST_CASES);
export const canManageTestItems = checkPermission(ACTIONS.MANAGE_TEST_ITEMS);
export const canManageTestPlans = checkPermission(ACTIONS.MANAGE_TEST_PLANS);
export const canManageUsers = checkPermission(ACTIONS.MANAGE_USERS);
export const canReadData = checkPermission(ACTIONS.READ_DATA);
export const canResizeAndDragWidgets = checkPermission(ACTIONS.RESIZE_AND_DRAG_WIDGETS);
export const canSeeActivityOption = checkPermission(ACTIONS.ACTIVITY_OPTION);
export const canSeeDemoData = checkPermission(ACTIONS.SEE_DEMO_DATA);
export const canSeeEmailMembers = checkPermission(ACTIONS.SEE_EMAIL_MEMBERS);
export const canSeeInstanceLevelPluginsPages = checkPermission(ACTIONS.INSTANCE_LEVEL_PLUGIN_PAGES);
export const canSeeMembers = checkPermission(ACTIONS.SEE_MEMBERS);
export const canSeeOrganizationMembers = checkPermission(ACTIONS.SEE_ORGANIZATION_MEMBERS);
export const canSeeRowActionMenu = checkPermission(ACTIONS.SEE_ROW_ACTION_MENU);
export const canSeeSettings = checkPermission(ACTIONS.SEE_SETTINGS);
export const canSeeSidebarOptions = checkPermission(ACTIONS.ACCESS_INSTANCE_LEVEL_PAGES);
export const canUpdateSettings = checkPermission(ACTIONS.UPDATE_SETTINGS);
export const canUpdateUserInstanceRole = checkPermission(ACTIONS.UPDATE_USER_INSTANCE_ROLE);
export const canViewInfoBilling = checkPermission(ACTIONS.VIEW_INFO_BILLING);
export const canWorkWithDashboard = checkPermission(ACTIONS.WORK_WITH_DASHBOARD);
export const canWorkWithDefectTypes = checkPermission(ACTIONS.WORK_WITH_DEFECT_TYPES);
export const canWorkWithFilters = checkPermission(ACTIONS.WORK_WITH_FILTERS);
export const canWorkWithOrganizationFilter = checkPermission(ACTIONS.WORK_WITH_ORGANIZATION_FILTER);
export const canWorkWithOrganizationsSorting = checkPermission(
  ACTIONS.WORK_WITH_ORGANIZATIONS_SORTING,
);
export const canWorkWithTests = checkPermission(ACTIONS.WORK_WITH_TESTS);
export const canWorkWithWidgets = checkPermission(ACTIONS.WORK_WITH_WIDGETS);
export const hasAccessToManagementSystem = checkPermission(ACTIONS.ACCESS_TO_MANAGEMENT_SYSTEM);
