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
  unassignProjectUser: {
    id: 'Assignment.unassignProjectUser',
    defaultMessage: 'Unassign User from Project',
  },
  unassignProjectSelf: {
    id: 'Assignment.unassignProjectSelf',
    defaultMessage: 'Unassign from Project',
  },
  unassignProjectUserDescription: {
    id: 'Assignment.unassignProjectUserDescription',
    defaultMessage:
      'Are you sure you want to unassign <b>{name}</b> from the project <b>{project}</b>? Assignment to the organization will remain unchanged.',
  },
  unassignProjectSelfDescription: {
    id: 'Assignment.unassignProjectSelfDescription',
    defaultMessage:
      'Are you sure you want to unassign yourself from the project <b>{project}</b>? Assignment to the organization will remain unchanged.',
  },
  manageAssignments: {
    id: 'Assignment.manageAssignments',
    defaultMessage: 'Manage assignments',
  },
  unassignOrganizationUser: {
    id: 'Assignment.unassignOrganizationUser',
    defaultMessage: 'Unassign User from Organization',
  },
  unassignOrganizationUserDescription: {
    id: 'Assignment.unassignOrganizationUserDescription',
    defaultMessage:
      'Are you sure you want to unassign <b>{name}</b> from the organization <b>{organization}</b>?',
  },
  unassignFromOrganization: {
    id: 'Assignment.unassignFromOrganization',
    defaultMessage: 'Unassign from Organization',
  },
  unassignFromOrganizationDescription: {
    id: 'Assignment.unassignFromOrganizationDescription',
    defaultMessage:
      'Are you sure you want to unassign yourself from the organization <b>{organization}</b>?',
  },
  yesUnassign: {
    id: 'Assignment.yesUnassign',
    defaultMessage: 'Yes, Unassign',
  },
  unassignConfirmation: {
    id: 'Assignment.unassignConfirmation',
    defaultMessage: 'Are you sure you want to unassign from the organization?',
  },
  unassignConfirmationUser: {
    id: 'Assignment.unassignConfirmationUser',
    defaultMessage: 'Are you sure you want to unassign user from the organization?',
  },
  manageAssignmentsHeader: {
    id: 'Assignment.manageAssignmentsHeader',
    defaultMessage: 'Manage Assignments of {name}',
  },
  unassignUpsaMessage: {
    id: 'Assignment.unassignUpsaMessage',
    defaultMessage:
      'Unable to unassign user from organization. Please verify user assignment to the organization in EPAM internal system: delivery.epam.com',
  },
  unassignPersonalOwnerMessage: {
    id: 'Assignment.unassignPersonalOwnerMessage',
    defaultMessage: "You can't unassign the owner of Personal organization",
  },
  unassignPersonalOwnerSelfMessage: {
    id: 'Assignment.unassignPersonalOwnerSelfMessage',
    defaultMessage: 'As the owner, you cannot unassign yourself from a Personal Organization',
  },
});
