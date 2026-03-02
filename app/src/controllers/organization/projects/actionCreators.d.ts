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

export interface ChangeProjectRolePayload {
  user: { id: number; fullName: string; userId?: string };
  projectKey: string;
  newProjectRole: string;
  onSuccess?: () => void;
}

export function fetchOrganizationProjectsAction(params: unknown): { type: string; payload: unknown };
export function fetchFilteredProjectAction(): { type: string };
export function createProjectAction(project: unknown): { type: string; payload: unknown };
export function deleteProjectAction(project: unknown): { type: string; payload: unknown };
export function renameProjectAction(project: unknown): { type: string; payload: unknown };
export function unassignFromProjectAction(
  user: unknown,
  project: unknown,
  onSuccess?: () => void,
): { type: string; payload: unknown };
export const changeProjectRoleAction: (
  user: ChangeProjectRolePayload['user'],
  projectKey: string,
  newProjectRole: string,
  onSuccess?: () => void,
) => { type: string; payload: ChangeProjectRolePayload };
