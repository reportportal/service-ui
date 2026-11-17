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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  provideAdminRights: {
    id: 'UpdateUserInstanceRole.provideAdminRights',
    defaultMessage: 'Provide Admin rights',
  },
  revokeAdminRights: {
    id: 'UpdateUserInstanceRole.revokeAdminRights',
    defaultMessage: 'Revoke Admin rights',
  },
  provideAdminRightsDescription: {
    id: 'UpdateUserInstanceRole.provideAdminRightsDescription',
    defaultMessage: 'Are you sure you want to provide the Admin rights for <b>{name}</b>?',
  },
  revokeAdminRightsDescription: {
    id: 'UpdateUserInstanceRole.revokeAdminRightsDescription',
    defaultMessage:
      'Are you sure you want to revoke the Admin rights for <b>{name}</b>? Assignments and roles will remain unchanged.',
  },
  successMessage: {
    id: 'UpdateUserInstanceRole.successMessage',
    defaultMessage: 'User {name} instance role has been changed successfully.',
  },
});
