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

import { createSelector } from 'reselect';
import { assignedOrganizationsSelector, userAccountRoleSelector } from 'controllers/user';
import { activeProjectRoleSelector } from './selectors';
import { urlOrganizationSlugSelector } from './typed-selectors';
import { OrganizationRoles, ProjectRoles, UserRoles } from 'types/roles';

interface Organization {
  organizationId: number;
  organizationName: string;
  organizationRole: OrganizationRoles;
  organizationSlug: string;
}

const activeOrganizationRoleSelector = createSelector(
  urlOrganizationSlugSelector,
  assignedOrganizationsSelector,
  (organizationSlug: string, assignedOrganizations: Record<string, Organization>) => {
    const assignedOrganization: Organization = assignedOrganizations[organizationSlug];

    return assignedOrganization?.organizationRole;
  },
);

export const userRolesSelector = createSelector(
  userAccountRoleSelector,
  activeOrganizationRoleSelector,
  activeProjectRoleSelector,
  (userRole: UserRoles, organizationRole: OrganizationRoles, projectRole: ProjectRoles) => ({
    userRole,
    organizationRole,
    projectRole,
  }),
);
