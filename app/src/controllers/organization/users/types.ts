export interface UserOrganizationProjectItem {
  id: number;
  project_role: string;
  name: string;
  slug: string;
}

export interface UserOrganizationProjectsResponse {
  offset: number;
  limit: number;
  total_count: number;
  sort: string;
  order: string;
  items: UserOrganizationProjectItem[];
}

export interface UpdateUserAssignmentsPayload {
  org_role: string;
  projects: Array<{ id: number; project_role: string }>;
}

export interface AssignOrganizationPayload {
  id: number;
  org_role: string;
  projects: Array<{ id: number; project_role: string }>;
}
