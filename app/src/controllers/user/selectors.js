import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { START_TIME_FORMAT_RELATIVE } from './constants';

const userSelector = (state) => state.user || {};
export const userInfoSelector = (state) => userSelector(state).info || {};
export const defaultProjectSelector = (state) => userInfoSelector(state).defaultProject || '';
export const activeProjectSelector = (state) =>
  userSelector(state).activeProject || defaultProjectSelector(state) || '';
export const userIdSelector = (state) => userInfoSelector(state).userId;
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

const apiTokenSelector = (state) => userSelector(state).token || '';
export const apiTokenValueSelector = (state) => apiTokenSelector(state).value;
export const apiTokenTypeSelector = (state) => apiTokenSelector(state).type;
export const apiTokenStringSelector = (state) =>
  `${apiTokenTypeSelector(state)} ${apiTokenValueSelector(state)}`;
