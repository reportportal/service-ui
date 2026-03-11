import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { OrganizationUserInfo } from 'controllers/user/types';
import type {
  UpdateUserAssignmentsPayload,
  UserOrganizationProjectItem,
  UserOrganizationProjectsResponse,
} from 'controllers/organization/users/types';
import type {
  Organization as OrganizationValue,
  Organization,
} from 'pages/inside/common/assignments/organizationAssignment';
import type { Project } from 'pages/inside/common/assignments/organizationAssignment/organizationItem/projectItems';
import type { Organization as OrgType } from 'controllers/organization';

export const MANAGE_ASSIGNMENTS_FORM = 'manageAssignmentsForm';

function normalizeProjectRole(projectRole: string): string {
  if (projectRole === EDITOR || projectRole === VIEWER) return projectRole;
  const role = (projectRole ?? '').toUpperCase();
  return role === EDITOR || role.includes('EDIT') ? EDITOR : VIEWER;
}

export function isAssignmentDirty(
  current: OrganizationValue | null,
  initial: OrganizationValue | null,
): boolean {
  if (!current || !initial) return false;
  if (current.role !== initial.role) return true;
  const currentProjects = JSON.stringify((current.projects ?? []).map((p) => ({ id: p.id, role: p.role })).sort((a, b) => a.id - b.id));
  const initialProjects = JSON.stringify((initial.projects ?? []).map((p) => ({ id: p.id, role: p.role })).sort((a, b) => a.id - b.id));
  return currentProjects !== initialProjects;
}

export function getCurrentOrganizationAssignment(
  organization: OrgType,
  assignmentsData: UserOrganizationProjectsResponse | null,
  user: OrganizationUserInfo,
): Organization {
  const orgRole = user.orgRole;
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
