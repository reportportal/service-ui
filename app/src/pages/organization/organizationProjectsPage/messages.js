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
  allOrganizations: {
    id: 'OrganizationProjectsPage.allOrganizations',
    defaultMessage: 'All organizations',
  },
  createProject: {
    id: 'OrganizationProjectsPage.createProject',
    defaultMessage: 'Create project',
  },
  noProjectsWithoutPermission: {
    id: 'OrganizationProjectsPage.noProjectsWithoutPermission',
    defaultMessage: 'No projects available yet',
  },
  noProjectsWithPermission: {
    id: 'OrganizationProjectsPage.noProjectsWithPermission',
    defaultMessage: 'No projects yet',
  },
  noProjectsListWithoutPermission: {
    id: 'OrganizationProjectsPage.noProjectsListWithoutPermission',
    defaultMessage:
      'The list of available to you projects is currently empty. <br />Contact your Organization’s manager for details.',
  },
  noProjectsListWithPermission: {
    id: 'OrganizationProjectsPage.noProjectsListWithPermission',
    defaultMessage: 'Create a new project to begin your ReportPortal journey',
  },
  projects: {
    id: 'OrganizationProjectsPage.projects',
    defaultMessage: 'Projects',
  },
  users: {
    id: 'OrganizationProjectsPage.users',
    defaultMessage: 'Users',
  },
  projectName: {
    id: 'OrganizationProjectsTableColumn.projectName',
    defaultMessage: 'Project name',
  },
  teammates: {
    id: 'OrganizationProjectsTableColumn.teammates',
    defaultMessage: 'Teammates',
  },
  launches: {
    id: 'OrganizationProjectsTableColumn.launches',
    defaultMessage: 'Launches',
  },
  lastLaunch: {
    id: 'OrganizationProjectsTableColumn.lastLaunch',
    defaultMessage: 'Last launch date',
  },
  addProject: {
    id: 'ProjectsPage.addProject',
    defaultMessage: 'Create Project',
  },
  projectNameLabel: {
    id: 'ProjectsPage.projectNameLabel',
    defaultMessage: 'Name',
  },
  projectNamePlaceholder: {
    id: 'ProjectsPage.projectNamePlaceholder',
    defaultMessage: 'Enter project’s name',
  },
  noResultsDescription: {
    id: 'ProjectsPage.noResultsDescription',
    defaultMessage:
      "Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.",
  },
  searchPlaceholder: {
    id: 'ProjectsPage.searchPlaceholder',
    defaultMessage: 'Type to search by name',
  },
});
