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
  title: {
    id: 'OrganizationsPage.title',
    defaultMessage: 'All Organizations',
  },
  description: {
    id: 'OrganizationsPage.description',
    defaultMessage: `The list of organizations available to you is currently empty. Please contact your Administrator to be assigned to an existing one.`,
  },
  createOrganization: {
    id: 'OrganizationsPage.createOrganization',
    defaultMessage: 'Create Organization',
  },
  createNewOrganization: {
    id: 'OrganizationsPage.createNewOrganization',
    defaultMessage: 'Create a new organization to begin your ReportPortal journey',
  },
  noOrganizationsYet: {
    id: 'OrganizationsPage.noOrganizationsYet',
    defaultMessage: 'No organizations yet',
  },
  noOrganizationsAvailableYet: {
    id: 'OrganizationsPage.noOrganizationsAvailableYet',
    defaultMessage: 'No organizations available yet',
  },
  synchedOrganization: {
    id: 'OrganizationsPage.synchedOrganization',
    defaultMessage: 'Synched organization',
  },
  lastLaunch: {
    id: 'OrganizationsPage.lastLaunch',
    defaultMessage: 'The last launch was executed more than 3 months ago',
  },
  organizationUsers: {
    id: 'OrganizationsPage.organizationUsers',
    defaultMessage: 'Organization users',
  },
  organizationProjects: {
    id: 'OrganizationsPage.organizationProjects',
    defaultMessage: 'Organization projects',
  },
  latestLaunch: {
    id: 'OrganizationsPage.latestLaunch',
    defaultMessage: 'The latest launch execution',
  },
  noLaunches: {
    id: 'OrganizationsPage.noLaunches',
    defaultMessage: 'No launches',
  },
  noResultsDescription: {
    id: 'OrganizationsPage.noResultsDescription',
    defaultMessage:
      "Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.",
  },
  searchPlaceholder: {
    id: 'OrganizationsPage.searchPlaceholder',
    defaultMessage: 'Type to search by name',
  },
  personalOrganization: {
    id: 'OrganizationsPage.personalOrganization',
    defaultMessage: 'Personal organization',
  },
  organizationName: {
    id: 'OrganizationsPage.organizationName',
    defaultMessage: 'Organization name',
  },
  projects: {
    id: 'OrganizationsPage.projects',
    defaultMessage: 'Projects',
  },
  users: {
    id: 'OrganizationsPage.users',
    defaultMessage: 'Users',
  },
  launches: {
    id: 'OrganizationsPage.launches',
    defaultMessage: 'Launches',
  },
  lastLaunchDate: {
    id: 'OrganizationsPage.lastLaunchDate',
    defaultMessage: 'Last launch date',
  },
  activity: {
    id: 'OrganizationsPage.activity',
    defaultMessage: 'Activity',
  },
  deleteOrganization: {
    id: 'OrganizationsPage.deleteOrganization',
    defaultMessage: 'Delete organization',
  },
  confirmDeleteOrganizationMessage: {
    id: 'OrganizationsPage.deleteOrganizationModalDescription',
    defaultMessage:
      'Are you sure you want to delete the <b>{name}</b> organization? This irreversible action will also delete all projects and associated data under this organization.',
  },
  confirmOrganizationNameEntry: {
    id: 'OrganizationsPage.confirmOrganizationNameEntry',
    defaultMessage: 'To confirm, please enter the name of the organization',
  },
});
