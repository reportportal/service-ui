/*
 * Copyright 2019 EPAM Systems
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
import { SETTINGS, MEMBERS, EVENTS } from 'common/constants/projectSections';

export const messages = defineMessages({
  pageTitle: {
    id: 'ProjectsPage.title',
    defaultMessage: 'All projects',
  },
  addProject: {
    id: 'ProjectsPage.addProject',
    defaultMessage: 'Add New Project',
  },
  addProjectTitle: {
    id: 'ProjectsPage.addProjectTitle',
    defaultMessage: 'Add project',
  },
  projectNameLabel: {
    id: 'ProjectsPage.projectNameLabel',
    defaultMessage: 'Project name',
  },
  projectLengthHint: {
    id: 'ProjectsPage.projectLengthHint',
    defaultMessage: 'Project name ',
  },
  [`${SETTINGS}Title`]: {
    id: 'ProjectDetailsPageSettings.title',
    defaultMessage: 'Settings',
  },
  [`${MEMBERS}Title`]: {
    id: 'ProjectDetailsPageMembers.title',
    defaultMessage: 'Members',
  },
  [`${EVENTS}Title`]: {
    id: 'ProjectDetailsPageEvents.title',
    defaultMessage: 'Events',
  },
  modalCancelButtonText: {
    id: 'Common.cancel',
    defaultMessage: 'Cancel',
  },
  deleteProjectsCount: {
    id: 'ProjectsPage.deleteProjectsCount',
    defaultMessage: '{count} items selected',
  },
  deleteModalHeader: {
    id: 'ProjectsPage.deleteModalHeader',
    defaultMessage: 'Delete project',
  },
  deleteModalMultipleHeader: {
    id: 'ProjectsPage.deleteModalMultipleHeader',
    defaultMessage: 'Delete projects',
  },
  deleteModalContent: {
    id: 'ProjectsPage.deleteModalContent',
    defaultMessage: 'Are you sure you want to delete the project {name}?',
  },
  deleteModalMultipleContent: {
    id: 'ProjectsPage.deleteModalMultipleContent',
    defaultMessage: 'Are you sure you want to delete the projects {names}?',
  },
  deleteError: {
    id: 'ProjectsPage.deleteError',
    defaultMessage: 'Error when deleting projects',
  },
  deleteSuccess: {
    id: 'ProjectsPage.deleteSuccess',
    defaultMessage: 'Project has been deleted',
  },
  deleteSuccessMultiple: {
    id: 'ProjectsPage.deleteSuccessMultiple',
    defaultMessage: 'Projects have been deleted',
  },
  deleteErrorMultiple: {
    id: 'ProjectsPage.deleteErrorMultiple',
    defaultMessage: 'Error when deleting projects',
  },
  members: {
    id: 'ProjectPanel.members',
    defaultMessage: 'Members',
  },
  settings: {
    id: 'ProjectPanel.settings',
    defaultMessage: 'Settings',
  },
  assign: {
    id: 'ProjectPanel.assign',
    defaultMessage: 'Assign',
  },
  unassign: {
    id: 'ProjectPanel.unassign',
    defaultMessage: 'Unassign',
  },
  delete: {
    id: 'ProjectPanel.delete',
    defaultMessage: 'Delete',
  },
  unassignFromPersonal: {
    id: 'ProjectPanel.unassignFromPersonal',
    defaultMessage: 'Impossible to unassign user from personal project',
  },
  launchesQuantity: {
    id: 'ProjectPanel.launchesQuantity',
    defaultMessage: 'Launches',
  },
  membersQuantity: {
    id: 'ProjectPanel.membersQuantity',
    defaultMessage: 'Members',
  },
  linkedTooltip: {
    id: 'ProjectPanel.linkedTooltip',
    defaultMessage: 'Synced with UPSA',
  },
  personalTooltip: {
    id: 'ProjectPanel.personalTooltip',
    defaultMessage: 'Personal project',
  },
  personal: {
    id: 'ProjectPanel.personal',
    defaultMessage: 'Personal',
  },
  internalTooltip: {
    id: 'ProjectPanel.internalTooltip',
    defaultMessage: 'Internal project',
  },
  internal: {
    id: 'ProjectPanel.internal',
    defaultMessage: 'Internal',
  },
  noMembers: {
    id: 'ProjectPanel.noMembers',
    defaultMessage: 'No members',
  },
  noLaunches: {
    id: 'ProjectPanel.noLaunches',
    defaultMessage: 'No launches',
  },
  lastLaunch: {
    id: 'ProjectPanel.lastLaunch',
    defaultMessage: '{date} run',
  },
  assignModalConfirmationText: {
    id: 'ProjectsPage.assignModalConfirmationText',
    defaultMessage: 'You are not a member of this project yet. Would you like to be assigned?',
  },
  assignModalTitle: {
    id: 'ProjectPage.assignModalTitle',
    defaultMessage: 'Assign to the project',
  },
  assignModalButton: {
    id: 'ProjectPage.assignButton',
    defaultMessage: 'Assign',
  },
  nameCol: { id: 'ProjectsGrid.nameCol', defaultMessage: 'Name' },
  projectTypeCol: { id: 'ProjectsGrid.projectTypeCol', defaultMessage: 'Project Type' },
  organizationCol: { id: 'ProjectsGrid.organizationCol', defaultMessage: 'Organization' },
  membersCol: { id: 'ProjectsGrid.membersCol', defaultMessage: 'Members' },
  membersColShort: { id: 'ProjectsGrid.membersColShort', defaultMessage: 'Mmbrs' },
  launchesCol: { id: 'ProjectsGrid.launchesCol', defaultMessage: 'Launches' },
  launchesColShort: { id: 'ProjectsGrid.launchesColShort', defaultMessage: 'Lnchs' },
  lastLaunchCol: { id: 'ProjectsGrid.lastLaunchCol', defaultMessage: 'Last Launch date' },
  lastLaunchColShort: { id: 'ProjectsGrid.lastLaunchColShort', defaultMessage: 'Lnch date' },
  sortBy: { id: 'ProjectsPage.sortBy', defaultMessage: 'Sort by' },
  dateCol: { id: 'ProjectsPage.dateCol', defaultMessage: 'Date' },
});
