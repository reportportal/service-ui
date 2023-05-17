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

import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { createSelector } from 'reselect';
import { INTERNAL } from 'common/constants/accountType';
import { projectInfoSelector } from 'controllers/project/selectors';
import { START_TIME_FORMAT_RELATIVE } from './constants';

const userSelector = (state) => state.user || {};
export const userInfoSelector = (state) => userSelector(state).info || {};
export const defaultProjectSelector = (state) => userInfoSelector(state).defaultProject || '';
export const activeProjectSelector = (state) =>
  userSelector(state).activeProject || defaultProjectSelector(state) || '';
export const idSelector = (state) => userInfoSelector(state).id;
export const userIdSelector = (state) => userInfoSelector(state).userId;
export const userEmailSelector = (state) => userInfoSelector(state).email || '';
export const photoIdSelector = (state) => userInfoSelector(state).photoId;
export const settingsSelector = (state) => userSelector(state).settings || {};
export const startTimeFormatSelector = (state) =>
  settingsSelector(state).startTimeFormat || START_TIME_FORMAT_RELATIVE;
export const photoTimeStampSelector = (state) => settingsSelector(state).photoTimeStamp || null;
export const assignedProjectsSelector = (state) => userInfoSelector(state).assignedProjects || {};
export const userAccountRoleSelector = (state) => userInfoSelector(state).userRole || '';
export const activeProjectRoleSelector = (state) => {
  const activeProject = activeProjectSelector(state);
  const assignedProject = assignedProjectsSelector(state)[activeProject];
  return assignedProject && assignedProject.projectRole;
};
export const isAdminSelector = (state) => userInfoSelector(state).userRole === ADMINISTRATOR;

export const availableProjectsSelector = createSelector(
  userInfoSelector,
  projectInfoSelector,
  activeProjectSelector,
  isAdminSelector,
  ({ assignedProjects }, { entryType = INTERNAL }, activeProjectName, isAdmin) => {
    const isAssignedToProject = assignedProjects[activeProjectName];
    const isPropagatedToUnassignedProject = isAdmin && !isAssignedToProject;

    return isPropagatedToUnassignedProject
      ? { ...assignedProjects, [activeProjectName]: { entryType } }
      : assignedProjects;
  },
);

// todo remove data
const data = [
  { id: 1, name: 'key1', hash: 'token1', created_at: 1684238171000 },
  { id: 2, name: 'key2', hash: 'token2', created_at: 1684230971000 },
  { id: 3, name: 'key3', hash: 'token3', created_at: 1684058171000 },
  { id: 4, name: 'key4', hash: 'token4', created_at: 1684065611000 },
  { id: 5, name: 'key5', hash: 'token5', created_at: 1234567 },
  { id: 6, name: 'key6', hash: 'token6', created_at: 12345678 },
  { id: 7, name: 'key7', hash: 'token7', created_at: 123456789 },
  { id: 8, name: 'key8', hash: 'token8', created_at: 1684224215125 },
];

// todo change data to []
export const apiKeysSelector = (state) => userSelector(state).apiKeys || data;
