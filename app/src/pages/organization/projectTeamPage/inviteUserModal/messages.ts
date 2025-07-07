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
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite User to',
  },
  canEditProject: {
    id: 'InviteUserModal.canEditProject',
    defaultMessage: 'Can edit the Project',
  },
  headerAssignUserModal: {
    id: 'InviteUserModal.headerAssignUserModal',
    defaultMessage: 'Assign User to',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage: `Please note, that new users joining this project's organization will be assigned the ‘Member’ role, while existing users will retain their current organizational roles and permissions.`,
  },
  email: {
    id: 'InviteUserModal.email',
    defaultMessage: 'Email',
  },
  descriptionAssign: {
    id: 'InviteUserModal.descriptionAssign',
    defaultMessage:
      'Please be aware that only users who are present on the instance can be assigned to the project.',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter email (e.g. example@mail.com)',
  },
  memberWasInvited: {
    id: 'InviteUserModal.memberWasInvited',
    defaultMessage: "User '<b>{name}</b>' has been invited and assigned successfully",
  },
  inviteExternalMember: {
    id: 'InviteUserModal.inviteExternalMember',
    defaultMessage:
      'Invite for member is successfully registered. Confirmation info will be send on provided email. Expiration: 1 day.',
  },
  hintMessage: {
    id: 'InviteUserModal.hintMessage',
    defaultMessage:
      "By default, invited users receive 'View only' permissions. Users with 'Can edit' permissions can modify the project and all its data (report launches, change defect types, etc.).",
  },
  externalInviteForbidden: {
    id: 'InviteUserModal.externalInviteForbidden',
    defaultMessage:
      'User with {email} is not in ReportPortal yet. New users can be added only via SSO. More info <a>{linkName}</a>',
  },
});
