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
  canEditOwnAccount,
  canManageLaunches,
  canManageManualLaunches,
  canManageOrganizations,
  canManageProjects,
  canManageTestCases,
  canManageTestItems,
  canManageTestPlans,
  canManageUsers,
  canReadData,
  canSeeActivityOption,
  canSeeDemoData,
  canSeeEmailMembers,
  canSeeInstanceLevelPluginsPages,
  canSeeMembers,
  canSeeOrganizationMembers,
  canSeeRowActionMenu,
  canSeeSettings,
  canSeeSidebarOptions,
  canUpdateSettings,
  canUpdateUserInstanceRole,
  canWorkWithFilters,
  canWorkWithOrganizationFilter,
  canWorkWithOrganizationsSorting,
  canWorkWithTests,
  hasAccessToManagementSystem,
} from './permissions';

export { getRoleTitle, getRoleBadgesData, getOrgRoleTitle } from './getRoleTitle';
