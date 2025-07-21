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

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

export enum Level {
  PROJECT = 'project',
  ORGANIZATION = 'organization',
}

export const ERROR_CODES = {
  FORBIDDEN: 4003,
};

export const settingsLinkName = 'Instance Invitation settings';
export const settingsLink =
  'https://reportportal.io/docs/admin-panel/ServerSettings/#instance-invitations_';
