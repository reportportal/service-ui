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

export {
  hasAccessToManagementSystem,
  canCreateProject,
  canDeleteProject,
  canUpdateSettings,
  canSeeSettings,
  canCreateInternalUser,
  canInviteInternalUser,
  canAssignUnassignInternalUser,
  canChangeUserRole,
  canDeleteUser,
  canSeeMembers,
  canEditOwnAccount,
  canDeleteLaunch,
  canEditLaunch,
  canBulkEditItems,
  canForceFinishLaunch,
  canStartAnalysis,
  canDeleteTestItem,
  canMoveToDebug,
  canMergeLaunches,
  canWorkWithFilters,
  canWorkWithOrganizationFilter,
  canReadData,
  canSeeDemoData,
  canWorkWithTests,
  canRenameProject,
  canInviteUserToProject,
  canSeeEmailMembers,
  canSeeRowActionMenu,
  canSeeSidebarOptions,
  canCreateOrganization,
  canUpdateOrganizationSettings,
  canSeeOrganizationMembers,
  canWorkWithOrganizationsSorting,
  canUpdateUserInstanceRole,
  canExportOrganizations,
  canInviteUserToOrganization,
  canSeeActivityOption,
  canDeleteOrganization,
  canSeeInstanceLevelPluginsPages,
  canRenameOrganization,
  // MANUAL LAUNCH
  canCreateManualLaunch,
  // TEST CASE
  canDoTestCaseBulkActions,
  canEditTestCase,
  canEditTestCaseScenario,
  canEditTestCaseTag,
  canMoveTestCase,
  canDeleteTestCaseFolder,
  canDuplicateTestCaseFolder,
  canRenameTestCaseFolder,
  // TEST CASES
  canImportTestCases,
  // TEST PLAN
  canEditTestPlan,
  canDeleteTestPlan,
  canDuplicateTestPlan,
  canCreateTestPlan,
} from './permissions';

export { getRoleTitle, getRoleBadgesData, getOrgRoleTitle } from './getRoleTitle';
