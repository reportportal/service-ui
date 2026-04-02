import { ProjectRoles } from 'types/roles';

export interface ProjectDetails {
  projectName: string;
  projectKey: string;
  projectId: number;
  projectSlug: string;
  projectRole: ProjectRoles;
  organizationSlug: string;
}
