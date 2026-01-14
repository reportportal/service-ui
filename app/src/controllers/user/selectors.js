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
import { START_TIME_FORMAT_ABSOLUTE, START_TIME_FORMAT_RELATIVE } from './constants';

const userSelector = (state) => state.user || {};
export const userInfoSelector = (state) => userSelector(state).info || {};
export const defaultProjectSelector = (state) => userInfoSelector(state).defaultProject || '';

/**
 * @param {Object} state
 * @returns {{ organizationSlug: string, projectSlug: string } | string}
 */
export const activeProjectSelector = (state) =>
  userSelector(state).activeProject || defaultProjectSelector(state) || '';
export const idSelector = (state) => userInfoSelector(state).id;
export const userIdSelector = (state) => userInfoSelector(state).userId;
export const userEmailSelector = (state) => userInfoSelector(state).email || '';
export const photoIdSelector = (state) => userInfoSelector(state).photoId;
export const fullNameSelector = (state) => userInfoSelector(state).fullName;
export const settingsSelector = (state) => userSelector(state).settings || {};
export const startTimeFormatSelector = (state) =>
  settingsSelector(state).startTimeFormat || START_TIME_FORMAT_RELATIVE;
export const logTimeFormatSelector = (state) =>
  settingsSelector(state).logTimeFormat || START_TIME_FORMAT_ABSOLUTE;
export const photoTimeStampSelector = (state) => settingsSelector(state).photoTimeStamp || null;
export const assignedProjectsSelector = (state) => userInfoSelector(state).assignedProjects || {};
export const assignedOrganizationsSelector = (state) =>
  userInfoSelector(state).assignedOrganizations || {};
export const userAccountRoleSelector = (state) => userInfoSelector(state).userRole || '';
export const isAdminSelector = (state) => userInfoSelector(state).userRole === ADMINISTRATOR;

export const availableProjectsSelector = createSelector(
  userInfoSelector,
  ({ assignedProjects, assignedOrganizations }) => {
    const assignedProjectMap = Object.keys(assignedProjects).map(
      (assignedProject) => assignedProjects[assignedProject],
    );

    return Object.keys(assignedOrganizations)
      .sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1))
      .reduce((projects, assignedOrganization) => {
        const { organizationSlug, organizationId, organizationName, organizationRole } =
          assignedOrganizations[assignedOrganization];
        const organizationProjects = assignedProjectMap
          .filter((assignedProject) => assignedProject.organizationId === organizationId)
          .map(({ projectName, projectSlug, projectKey, projectRole }) => ({
            projectName,
            projectSlug,
            projectKey,
            projectRole,
          }));

        return [
          ...projects,
          {
            organizationSlug,
            organizationName,
            organizationRole,
            projects: organizationProjects.sort((a, b) =>
              a.projectName.toLowerCase() > b.projectName.toLowerCase() ? 1 : -1,
            ),
          },
        ];
      }, []);
  },
);

export const apiKeysSelector = (state) => userSelector(state).apiKeys || [];

export const activeProjectKeySelector = (state) => userSelector(state).activeProjectKey;
