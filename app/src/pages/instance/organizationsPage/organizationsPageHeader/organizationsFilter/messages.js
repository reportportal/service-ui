/*
 * Copyright 2024 EPAM Systems
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
  lastRunDate: {
    id: 'OrganizationsFilter.lastRunDate',
    defaultMessage: 'Last run date',
  },
  launches: {
    id: 'OrganizationsFilter.launches',
    defaultMessage: 'Launches',
  },
  launchesPlaceholder: {
    id: 'OrganizationsFilter.launchesPlaceholder',
    defaultMessage: 'Enter the number of launches',
  },
  users: {
    id: 'OrganizationsFilter.users',
    defaultMessage: 'Users',
  },
  usersPlaceholder: {
    id: 'OrganizationsFilter.usersPlaceholder',
    defaultMessage: 'Enter the number of members',
  },
  organizationType: {
    id: 'OrganizationsFilter.organizationType',
    defaultMessage: 'Organization type',
  },
  organizationTypePlaceholder: {
    id: 'OrganizationsFilter.organizationTypePlaceholder',
    defaultMessage: 'Select organization type',
  },
  typePersonal: {
    id: 'OrganizationsFilter.typePersonal',
    defaultMessage: 'Personal',
  },
  typeInternal: {
    id: 'OrganizationsFilter.typeInternal',
    defaultMessage: 'Internal',
  },
  typeSynched: {
    id: 'OrganizationsFilter.typeSynced',
    defaultMessage: 'Synched',
  },
});
