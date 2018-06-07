import { stringify } from 'qs';
import { TOKEN_KEY } from 'controllers/auth';

const urlBase = '/api/v1/';
const getToken = () => (localStorage.getItem(TOKEN_KEY) || '').split(' ')[1];
const getQueryParams = (paramsObj) => stringify(paramsObj, { addQueryPrefix: true });

export const URLS = {
  dataPhoto: (userId, at) =>
    `${urlBase}data/photo${getQueryParams({ [userId]: null, at, access_token: getToken() })}`,
  dataUserPhoto: (v, id) =>
    `${urlBase}data/userphoto${getQueryParams({ v, id, access_token: getToken() })}`,

  dashboard: (activeProject, id) => `${urlBase}${activeProject}/dashboard/${id}`,
  dashboards: (activeProject) => `${urlBase}${activeProject}/dashboard`,
  dashboardsShared: (activeProject) =>
    `${urlBase}${activeProject}/dashboard/shared${getQueryParams({
      'page.page': 1,
      'page.size': 300,
    })}`,

  filter: (activeProject, id) => `${urlBase}${activeProject}/filter/${id}`,
  filters: (activeProject) => `${urlBase}${activeProject}/filter`,

  launch: (activeProject, id) => `${urlBase}${activeProject}/launch/${id}`,
  launchTagsSearch: (activeProject) => `${urlBase}${activeProject}/launch/tags?filter.cnt.tags=`,
  launches: (activeProject, ids) => `${urlBase}${activeProject}/launch${getQueryParams({ ids })}`,
  launchUpdate: (activeProject) => `${urlBase}${activeProject}/launch/update`,
  launchesUpdate: (activeProject, id) => `${urlBase}${activeProject}/launch/${id}/update`,
  launchesMerge: (activeProject) => `${urlBase}${activeProject}/launch/merge`,
  launchesCompare: (activeProject, ids) =>
    `${urlBase}${activeProject}/launch/compare${getQueryParams({ ids })}`,
  launchImport: (activeProject) => `${urlBase}${activeProject}/launch/import`,
  login: (grantType, username, password) =>
    `/uat/sso/oauth/token${getQueryParams({
      grant_type: grantType,
      username,
      password,
    })}`,

  project: (activeProject) => `${urlBase}project/${activeProject}`,
  projectPreferences: (activeProject, userId) =>
    `${urlBase}project/${activeProject}/preference/${userId}`,
  projectUsers: (activeProject) => `${urlBase}project/${activeProject}/users`,
  projectAdminSearchUser: (input) =>
    `${urlBase}user/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'login,ASC',
      term: input,
    })}`,
  projectUserSearchUser: (activeProject, input) =>
    `${urlBase}project/${activeProject}/usernames/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'login,ASC',
      term: input,
    })}`,

  suites: (activeProject, launchId) =>
    `${urlBase}${activeProject}/item${getQueryParams({ 'filter.eq.launch': launchId })}`,

  user: () => `${urlBase}user`,
  userRegistration: () => `${urlBase}user/registration`,
  userPasswordReset: () => `${urlBase}user/password/reset`,
  userPasswordResetToken: (token) => `${urlBase}user/password/reset/${token}`,
  userPasswordRestore: () => `${urlBase}user/password/restore`,
  userInviteInternal: (activeProject) => `${urlBase}project/${activeProject}/assign`,
  userInviteExternal: () => `${urlBase}user/bid`,
};
