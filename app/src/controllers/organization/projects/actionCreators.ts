/*
 * Copyright 2026 EPAM Systems
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

import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  FETCH_ORGANIZATION_PROJECTS,
  FETCH_FILTERED_PROJECTS,
  RENAME_PROJECT,
  UNASSIGN_FROM_PROJECT,
  SELF_ASSIGN_TO_PROJECT,
  CHANGE_PROJECT_ROLE,
} from './constants';

export const fetchOrganizationProjectsAction = (organizationId: number | string) => {
  return {
    type: FETCH_ORGANIZATION_PROJECTS,
    payload: organizationId,
  } as const;
};

export const createProjectAction = (project: { newProjectName: string }) => ({
  type: CREATE_PROJECT,
  payload: project,
} as const);

export const deleteProjectAction = (project: { projectId: number | string; projectName: string }) => ({
  type: DELETE_PROJECT,
  payload: project,
} as const);

export const renameProjectAction = (project: {
  projectId: number | string;
  newProjectName: string;
}) => ({
  type: RENAME_PROJECT,
  payload: project,
} as const);

export const fetchFilteredProjectAction = () => ({
  type: FETCH_FILTERED_PROJECTS,
} as const);

export const selfAssignToProjectAction = (projectId: number | string, onSuccess?: () => void) => ({
  type: SELF_ASSIGN_TO_PROJECT,
  payload: { projectId, onSuccess },
} as const);

export const unassignFromProjectAction = (
  user: { id: number; fullName: string },
  project: { projectId: number | string },
  onSuccess?: () => void,
) => ({
  type: UNASSIGN_FROM_PROJECT,
  payload: { user, project, onSuccess },
} as const);

export const changeProjectRoleAction = (
  user: { id: number; fullName: string; userId: string },
  projectKey: string,
  newProjectRole: string,
  onSuccess?: () => void,
) => ({
  type: CHANGE_PROJECT_ROLE,
  payload: { user, projectKey, newProjectRole, onSuccess },
} as const);
