import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import type { OrganizationRoles, ProjectRoles, UserRoles } from 'types/roles';
import { OrganizationUserInfo } from 'controllers/user/types';
import type {
  AssignOrganizationPayload,
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

export function normalizeProjectRole(projectRole: string): string {
  if (projectRole === EDITOR || projectRole === VIEWER) return projectRole;
  const role = (projectRole ?? '').toUpperCase();
  return role === EDITOR || role.includes('EDIT') ? EDITOR : VIEWER;
}

export type UserRolesSnapshot = {
  userRole: UserRoles;
  organizationRole: OrganizationRoles;
  projectRole: ProjectRoles;
};

export function resolveUserRolesForProjectRow(
  base: UserRolesSnapshot,
  rowProjectRole?: ProjectRoles | '',
): UserRolesSnapshot {
  return {
    ...base,
    projectRole: rowProjectRole || base.projectRole,
  };
}

export function mapProjectsFromResponse(
  response: UserOrganizationProjectsResponse | null | undefined,
): Project[] {
  return (response?.items ?? []).map((item: UserOrganizationProjectItem) => ({
    id: item.id,
    name: item.name,
    role: normalizeProjectRole(item.project_role),
  }));
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
  const projects = mapProjectsFromResponse(assignmentsData);
  return {
    id: organization.id,
    name: organization.name,
    type: organization.type,
    owner_id: organization.owner_id,
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

export function buildAssignOrganizationPayload(
  organization: Organization,
  userId: number,
): AssignOrganizationPayload {
  return {
    id: userId,
    org_role: organization.role,
    projects: (organization.projects ?? []).map((project) => ({
      id: project.id,
      project_role: project.role,
    })),
  };
}

const MANAGE_ASSIGNMENTS_CONDITIONS = {
  ADD_PROJECT: 'add project',
  REMOVE_PROJECT: 'remove project',
  CHANGE_ROLE: 'change role',
  CHANGE_PERMISSION: 'change permission',
  ADD_ORGANIZATION: 'add organization',
  REMOVE_ORGANIZATION: 'remove organization',
} as const;

export function getManageAssignmentsSaveCondition(
  initial: OrganizationValue | null,
  current: OrganizationValue | null,
): string {
  if (!initial || !current) return '';
  const parts: string[] = [];
  if (initial.role !== current.role) {
    parts.push(MANAGE_ASSIGNMENTS_CONDITIONS.CHANGE_ROLE);
  }
  const initialProjectIds = new Set((initial.projects ?? []).map((p) => p.id));
  const currentProjectIds = new Set((current.projects ?? []).map((p) => p.id));
  const initialById = new Map((initial.projects ?? []).map((p) => [p.id, p]));
  const currentById = new Map((current.projects ?? []).map((p) => [p.id, p]));
  if ([...currentProjectIds].some((id) => !initialProjectIds.has(id))) {
    parts.push(MANAGE_ASSIGNMENTS_CONDITIONS.ADD_PROJECT);
  }
  if ([...initialProjectIds].some((id) => !currentProjectIds.has(id))) {
    parts.push(MANAGE_ASSIGNMENTS_CONDITIONS.REMOVE_PROJECT);
  }
  const permissionChanged = [...currentProjectIds].some((id) => {
    if (!initialProjectIds.has(id)) return false;
    const a = initialById.get(id);
    const b = currentById.get(id);
    return a && b && a.role !== b.role;
  });
  if (permissionChanged) {
    parts.push(MANAGE_ASSIGNMENTS_CONDITIONS.CHANGE_PERMISSION);
  }
  return parts.join('#');
}

export function getManageAssignmentsInstanceChangeSet(
  initial: OrganizationValue[],
  current: OrganizationValue[],
) {
  const currentIds = new Set(current.map((o) => o.id));
  const initialIds = new Set(initial.map((o) => o.id));

  const removed = initial.filter((org) => !currentIds.has(org.id));
  const added = current.filter((org) => !initialIds.has(org.id));
  const modified = current.filter((org) => {
    const initialOrg = initial.find((io) => io.id === org.id);
    if (!initialOrg) {
      return false;
    }
    return isAssignmentDirty(org, initialOrg);
  });

  return { removed, modified, added };
}

/** Maps org-level save condition parts to instance GA labels */
const ORG_SAVE_CONDITION_TO_INSTANCE: Record<string, string> = {
  [MANAGE_ASSIGNMENTS_CONDITIONS.CHANGE_ROLE]: 'change org role',
  [MANAGE_ASSIGNMENTS_CONDITIONS.CHANGE_PERMISSION]: 'change project role',
};

function mergeOrgSaveConditionIntoSet(orgCondition: string, target: Set<string>): void {
  if (!orgCondition) return;
  orgCondition.split('#').forEach((part) => {
    target.add(ORG_SAVE_CONDITION_TO_INSTANCE[part] || part);
  });
}

export function getManageAssignmentsInstanceSaveCondition(
  initial: OrganizationValue[],
  current: OrganizationValue[],
): string {
  const { removed, added, modified } = getManageAssignmentsInstanceChangeSet(initial, current);
  const parts = new Set<string>();
  if (removed.length > 0) {
    parts.add(MANAGE_ASSIGNMENTS_CONDITIONS.REMOVE_ORGANIZATION);
  }
  if (added.length > 0) {
    parts.add(MANAGE_ASSIGNMENTS_CONDITIONS.ADD_ORGANIZATION);

    if (added.some((org) => org.projects.length)) {
      parts.add(MANAGE_ASSIGNMENTS_CONDITIONS.ADD_PROJECT);
    }
  }
  modified.forEach((org) => {
    const initialOrg = initial.find((io) => io.id === org.id);
    if (initialOrg) {
      mergeOrgSaveConditionIntoSet(getManageAssignmentsSaveCondition(initialOrg, org), parts);
    }
  });
  return [...parts].join('#');
}
