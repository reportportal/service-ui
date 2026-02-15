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
  canForceFinishRerunLaunch,
  canStartAnalysis,
  canDeleteTestItem,
  canMoveToDebug,
  canChangeTestItemStatus,
  canMakeDecision,
  canManageBTSIssues,
  canMergeLaunches,
  canWorkWithFilters,
  canWorkWithOrganizationFilter,
  canReadData,
  canSeeDemoData,
  canResizeAndDragWidgets,
  canWorkWithWidgets,
  canWorkWithDefectTypes,
  canReportLaunches,
  canWorkWithTests,
  canWorkWithDashboard,
  canRenameProject,
  canInviteUserToProject,
  canChangeAccessProject,
  canViewInfoBilling,
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

  // TMS FEATURES:
  canLockDashboard,
  canCreateManualLaunch,
  canManageTestCases,
  canManageTestPlans,
} from './permissions';

export { getRoleTitle, getRoleBadgesData, getOrgRoleTitle } from './getRoleTitle';
