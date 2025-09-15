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
