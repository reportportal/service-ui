import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import type { UserInfo } from 'controllers/user/types';
import type {
  UpdateUserAssignmentsPayload,
  UserOrganizationProjectItem,
  UserOrganizationProjectsResponse,
} from 'controllers/organization/users/types';
import type { Organization } from 'pages/inside/common/assignments/organizationAssignment';
import type { Project } from 'pages/inside/common/assignments/organizationAssignment/organizationItem/projectItems';
import type { Organization as OrgType } from 'controllers/organization';

export const MANAGE_ASSIGNMENTS_FORM = 'manageAssignmentsForm';

function normalizeProjectRole(projectRole: string): string {
  if (projectRole === EDITOR || projectRole === VIEWER) return projectRole;
  const upper = (projectRole || '').toUpperCase();
  if (upper.includes('EDIT') || upper === 'EDITOR') return EDITOR;
  return VIEWER;
}

export function getCurrentOrganizationAssignment(
  organization: OrgType,
  assignmentsData: UserOrganizationProjectsResponse | null,
  user: UserInfo,
): Organization {
  const orgs = user.assignedOrganizations || {};
  const assignedOrg = Object.values(orgs).find((o) => o.organizationId === organization.id);
  const orgRole = assignedOrg?.organizationRole || 'MEMBER';
  const projects: Project[] = (assignmentsData?.items ?? []).map(
    (item: UserOrganizationProjectItem) => ({
      id: item.id,
      name: item.name,
      role: normalizeProjectRole(item.project_role),
    }),
  );
  return {
    id: organization.id,
    name: organization.name,
    role: orgRole,
    projects,
  };
}

export function buildUpdateAssignmentsPayload(
  currentOrganization: Organization,
): UpdateUserAssignmentsPayload {
  return {
    org_role: currentOrganization.role,
    projects: (currentOrganization.projects ?? []).map((p) => ({
      id: p.id,
      project_role: p.role,
    })),
  };
}
