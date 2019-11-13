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

import {
  toggleItemSelectionAction,
  toggleAllItemsAction,
  defineGroupOperation,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { SETTINGS } from 'common/constants/projectSections';
import { GENERAL } from 'common/constants/settingsTabs';
import {
  FETCH_PROJECTS,
  START_SET_VIEW_MODE,
  NAMESPACE,
  DELETE_PROJECT,
  NAVIGATE_TO_PROJECT,
  CONFIRM_ASSIGN_TO_PROJECT,
  ADD_PROJECT,
} from './constants';

export const fetchProjectsAction = (params) => ({
  type: FETCH_PROJECTS,
  payload: params,
});

export const startSetViewMode = (viewMode) => ({
  type: START_SET_VIEW_MODE,
  payload: { viewMode },
});

export const toggleProjectSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const toggleAllProjectsAction = toggleAllItemsAction(NAMESPACE);
export const unselectAllProjectsAction = unselectAllItemsAction(NAMESPACE);

export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteProjects',
  (items, { onConfirm, header, mainContent, userId, warning, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, userId, warning, eventsInfo },
    }),
  () => {},
);

export const addProjectAction = (projectName) => ({
  type: ADD_PROJECT,
  payload: projectName,
});

export const deleteProjectAction = (project) => ({
  type: DELETE_PROJECT,
  payload: project,
});

export const navigateToProjectAction = (project) => ({
  type: NAVIGATE_TO_PROJECT,
  payload: project,
});

export const confirmAssignToProject = (project) => ({
  type: CONFIRM_ASSIGN_TO_PROJECT,
  payload: project,
});

export const navigateToProjectSectionAction = (projectName, section) => ({
  type: PROJECT_DETAILS_PAGE,
  payload: {
    projectId: projectName,
    projectSection: section,
    settingsTab: section === SETTINGS ? GENERAL : undefined,
  },
});
