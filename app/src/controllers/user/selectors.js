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
export const activeProjectKeySelector = (state) => userSelector(state).activeProjectKey || '';
export const activeProjectRoleSelector = (state) => {
  const activeProjectKey = activeProjectKeySelector(state);
  const assignedProject = assignedProjectsSelector(state)[activeProjectKey];
  return assignedProject && assignedProject.projectRole;
};
export const isAdminSelector = (state) => userInfoSelector(state).userRole === ADMINISTRATOR;

export const availableProjectsSelector = createSelector(
  userInfoSelector,
  projectInfoSelector,
  activeProjectSelector,
  isAdminSelector,
  ({ assignedProjects }, { entryType = INTERNAL }, activeProjectName, isAdmin) => {
    const isAssignedToProject = activeProjectName && assignedProjects[activeProjectName];
    const isPropagatedToUnassignedProject = isAdmin && !isAssignedToProject;

    return isPropagatedToUnassignedProject
      ? { ...assignedProjects, [activeProjectName]: { entryType } }
      : assignedProjects;
  },
);

export const apiKeysSelector = (state) => userSelector(state).apiKeys || [];
const apiTokenSelector = (state) => userSelector(state).token || '';
export const apiTokenValueSelector = (state) => apiTokenSelector(state).value;
export const apiTokenTypeSelector = (state) => apiTokenSelector(state).type;
export const apiTokenStringSelector = (state) =>
  `${apiTokenTypeSelector(state)} ${apiTokenValueSelector(state)}`;
