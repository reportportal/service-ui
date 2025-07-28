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

export interface AssignedProject {
  projectRole: string;
  projectKey: string;
  projectSlug: string;
  projectName: string;
  organizationId: number;
}

export interface AssignedOrganization {
  organizationId: number;
  organizationSlug: string;
  organizationRole: string;
  organizationName: string;
}

export interface UserMetadata {
  last_login: number;
}

export interface UserInfo {
  uuid: string;
  active: boolean;
  id: number;
  userId: string;
  email: string;
  fullName: string;
  accountType: string;
  userRole: string;
  photoLoaded: boolean;
  metadata: UserMetadata;
  assignedProjects: Record<string, AssignedProject>;
  assignedOrganizations: Record<string, AssignedOrganization>;
}
