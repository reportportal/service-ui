import { ADMINISTRATOR } from 'common/constants/accountRoles';

const userSelector = (state) => state.user || {};
export const userInfoSelector = (state) => userSelector(state).info || {};
export const defaultProjectSelector = (state) => userInfoSelector(state).default_project || '';
export const activeProjectSelector = (state) =>
  userSelector(state).activeProject || defaultProjectSelector(state) || '';
export const userIdSelector = (state) => userInfoSelector(state).userId;
export const settingsSelector = (state) => userSelector(state).settings;
export const startTimeFormatSelector = (state) => settingsSelector(state).startTimeFormat;
export const assignedProjectsSelector = (state) => userInfoSelector(state).assigned_projects || {};
export const userAccountRoleSelector = (state) => userInfoSelector(state).userRole || '';
export const activeProjectRoleSelector = (state) => {
  const activeProject = activeProjectSelector(state);
  const assignedProject = assignedProjectsSelector(state)[activeProject];
  return assignedProject && assignedProject.projectRole;
};
export const isAdminSelector = (state) => userInfoSelector(state).userRole === ADMINISTRATOR;
export const userRoleSelector = (state) => userSelector(state).userRole;
