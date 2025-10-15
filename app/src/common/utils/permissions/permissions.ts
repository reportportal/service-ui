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

export const hasAccessToManagementSystem = checkPermission(ACTIONS.ACCESS_TO_MANAGEMENT_SYSTEM);
export const canCreateProject = checkPermission(ACTIONS.CREATE_PROJECT);
export const canDeleteProject = checkPermission(ACTIONS.DELETE_PROJECT);
export const canRenameProject = checkPermission(ACTIONS.RENAME_PROJECT);
export const canInviteUserToProject = checkPermission(ACTIONS.INVITE_USER_TO_PROJECT);
export const canInviteUserToOrganization = checkPermission(ACTIONS.INVITE_USER_TO_ORGANIZATION);
export const canChangeAccessProject = checkPermission(ACTIONS.CHANGE_ACCESS_PROJECT);
export const canViewInfoBilling = checkPermission(ACTIONS.VIEW_INFO_BILLING);
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
export const canEditLaunch = checkPermission(ACTIONS.EDIT_LAUNCH);
export const canBulkEditItems = checkPermission(ACTIONS.BULK_EDIT_ITEMS);
export const canForceFinishLaunch = checkPermission(ACTIONS.FORCE_FINISH_LAUNCH);
export const canForceFinishRerunLaunch = checkPermission(ACTIONS.FORCE_FINISH_RERUN_LAUNCH);
export const canStartAnalysis = checkPermission(ACTIONS.START_ANALYSIS);
export const canDeleteTestItem = checkPermission(ACTIONS.DELETE_TEST_ITEM);
export const canMoveToDebug = checkPermission(ACTIONS.MOVE_TO_DEBUG);
export const canChangeTestItemStatus = checkPermission(ACTIONS.CHANGE_TEST_ITEM_STATUS);
export const canMakeDecision = checkPermission(ACTIONS.MAKE_DECISION);
export const canManageBTSIssues = checkPermission(ACTIONS.MANAGE_BTS_ISSUES);
export const canMergeLaunches = checkPermission(ACTIONS.MERGE_LAUNCHES);
export const canWorkWithFilters = checkPermission(ACTIONS.WORK_WITH_FILTERS);
export const canWorkWithOrganizationFilter = checkPermission(ACTIONS.WORK_WITH_ORGANIZATION_FILTER);
export const canReadData = checkPermission(ACTIONS.READ_DATA);
export const canSeeDemoData = checkPermission(ACTIONS.SEE_DEMO_DATA);
export const canResizeAndDragWidgets = checkPermission(ACTIONS.RESIZE_AND_DRAG_WIDGETS);
export const canWorkWithWidgets = checkPermission(ACTIONS.WORK_WITH_WIDGETS);
export const canWorkWithDefectTypes = checkPermission(ACTIONS.WORK_WITH_DEFECT_TYPES);
export const canReportLaunches = checkPermission(ACTIONS.REPORT_LAUNCHES);
export const canUpdateOrganizationSettings = checkPermission(ACTIONS.UPDATE_ORGANIZATION_SETTINGS);
export const canSeeOrganizationMembers = checkPermission(ACTIONS.SEE_ORGANIZATION_MEMBERS);
export const canCreateOrganization = checkPermission(ACTIONS.CREATE_ORGANIZATION);
export const canDeleteOrganization = checkPermission(ACTIONS.DELETE_ORGANIZATION);
export const canRenameOrganization = checkPermission(ACTIONS.RENAME_ORGANIZATION);
export const canWorkWithDashboard = checkPermission(ACTIONS.WORK_WITH_DASHBOARD);
export const canWorkWithTests = checkPermission(ACTIONS.WORK_WITH_TESTS);
export const canSeeEmailMembers = checkPermission(ACTIONS.SEE_EMAIL_MEMBERS);
export const canSeeRowActionMenu = checkPermission(ACTIONS.SEE_ROW_ACTION_MENU);
export const canSeeSidebarOptions = checkPermission(ACTIONS.ACCESS_INSTANCE_LEVEL_PAGES);
export const canWorkWithOrganizationsSorting = checkPermission(
  ACTIONS.WORK_WITH_ORGANIZATIONS_SORTING,
);
export const canUpdateUserInstanceRole = checkPermission(ACTIONS.UPDATE_USER_INSTANCE_ROLE);
export const canExportOrganizations = checkPermission(ACTIONS.EXPORT_ORGANIZATIONS);
export const canSeeActivityOption = checkPermission(ACTIONS.ACTIVITY_OPTION);
export const canSeeInstanceLevelPluginsPages = checkPermission(ACTIONS.INSTANCE_LEVEL_PLUGIN_PAGES);
// MANUAL LAUNCHES
export const canCreateManualLaunch = checkPermission(ACTIONS.CREATE_MANUAL_LAUNCH);
// TEST CASE
export const canEditTestCase = checkPermission(ACTIONS.EDIT_TEST_CASE);
export const canEditTestCaseTag = checkPermission(ACTIONS.EDIT_TEST_CASE_TAG);
export const canMoveTestCase = checkPermission(ACTIONS.MOVE_TEST_CASE);
export const canDoTestCaseBulkActions = checkPermission(ACTIONS.TEST_CASE_BULK_ACTIONS);
// TEST CASES
export const canImportTestCases = checkPermission(ACTIONS.IMPORT_TEST_CASES);
// TEST PLAN
export const canCreateTestPlan = checkPermission(ACTIONS.CREATE_TEST_PLAN);
export const canDeleteTestPlan = checkPermission(ACTIONS.DELETE_TEST_PLAN);
export const canDuplicateTestPlan = checkPermission(ACTIONS.DUPLICATE_TEST_PLAN);
export const canEditTestPlan = checkPermission(ACTIONS.EDIT_TEST_PLAN);
// TEST CASE FOLDER
export const canDeleteTestCaseFolder = checkPermission(ACTIONS.DELETE_TEST_CASE_FOLDER);
export const canDuplicateTestCaseFolder = checkPermission(ACTIONS.DUPLICATE_TEST_CASE_FOLDER);
export const canRenameTestCaseFolder = checkPermission(ACTIONS.RENAME_TEST_CASE_FOLDER);
