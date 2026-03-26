/*!
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
  organizationUsersTitle: {
    id: 'OrganizationUsers.organizationUsersTitle',
    defaultMessage: 'Organization users',
  },
  projectTeamTitle: {
    id: 'ProjectTeamPage.title',
    defaultMessage: 'Project team',
  },
  noUsers: {
    id: 'ProjectTeamPage.noUsers',
    defaultMessage: 'No users added yet',
  },
  description: {
    id: 'ProjectTeamPage.description',
    defaultMessage:
      'User list is currently empty. To make the most out of your project, invite your team members and collaborate efficiently.',
  },
  inviteUser: {
    id: 'ProjectTeamPage.inviteUser',
    defaultMessage: 'Invite user',
  },
  searchPlaceholder: {
    id: 'ProjectTeamPage.searchPlaceholder',
    defaultMessage: 'Type to search by name',
  },
  noResultsDescription: {
    id: 'ProjectTeamPage.noResultsDescription',
    defaultMessage:
      "Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.",
  },
  allOrganizations: {
    id: 'ProjectTeamPage.allOrganizations',
    defaultMessage: 'All Organizations',
  },
});
