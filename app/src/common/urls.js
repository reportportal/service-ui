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

  externalSystemIssue: (activeProject, systemId, issueId) =>
    `${urlBase}${activeProject}/external-system/${systemId}/ticket/${issueId}`,

  filter: (activeProject, id) => `${urlBase}${activeProject}/filter/${id}`,
  filters: (activeProject) => `${urlBase}${activeProject}/filter`,
  filtersSearch: (activeProject) =>
    `${urlBase}${activeProject}/filter?page.sort=name&page.page=1&page.size=50&filter.cnt.name=`,

  debug: (activeProject) => `${urlBase}${activeProject}/launch/mode`,

  launch: (activeProject, id) => `${urlBase}${activeProject}/launch/${id}`,
  launchTagsSearch: (activeProject) => `${urlBase}${activeProject}/launch/tags?filter.cnt.tags=`,
  launchNameSearch: (activeProject) => `${urlBase}${activeProject}/launch/names?filter.cnt.name=`,
  launchOwnersSearch: (activeProject) =>
    `${urlBase}${activeProject}/launch/owners?filter.cnt.user=`,
  launches: (activeProject, ids) => `${urlBase}${activeProject}/launch${getQueryParams({ ids })}`,
  launchUpdate: (activeProject) => `${urlBase}${activeProject}/launch/update`,
  launchStop: (activeProject) => `${urlBase}${activeProject}/launch/stop`,
  launchesItemsUpdate: (activeProject, id, type) =>
    `${urlBase}${activeProject}/${type}/${id}/update`,
  launchesMerge: (activeProject) => `${urlBase}${activeProject}/launch/merge`,
  launchesCompare: (activeProject, ids) =>
    `${urlBase}${activeProject}/launch/compare${getQueryParams({ ids })}`,

  launchImport: (activeProject) => `${urlBase}${activeProject}/launch/import`,
  exportLaunch: (projectId, launchId, exportType) =>
    `${urlBase}${projectId}/launch/${launchId}/report${getQueryParams({
      view: exportType,
      access_token: getToken(),
    })}`,

  login: (grantType, username, password) =>
    `/uat/sso/oauth/token${getQueryParams({
      grant_type: grantType,
      username,
      password,
    })}`,
  apiToken: () => `uat/sso/me/apitoken`,
  sessionToken: () => `${urlBase}uat/sso/me`,

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
  projectUsernamesSearch: (activeProject) =>
    `${urlBase}project/${activeProject}/usernames?filter.cnt.users=`,
  projectIndex: (activeProject) => `${urlBase}project/${activeProject}/index`,

  projectPreferencesEmailConfiguration: (activeProject) =>
    `${urlBase}project/${activeProject}/emailconfig`,
  suite: (activeProject, suiteId) => `${urlBase}${activeProject}/item/${suiteId}`,

  testItems: (activeProject, ids) => `${urlBase}${activeProject}/item${getQueryParams({ ids })}`,
  testItem: (activeProject, id = '') => `${urlBase}${activeProject}/item/${id}`,
  testItemsHistory: (activeProject, ids, historyDepth) =>
    `${urlBase}${activeProject}/item/history${getQueryParams({
      ids,
      history_depth: historyDepth,
    })}`,
  testItemsAddIssues: (activeProject) => `${urlBase}${activeProject}/item/issue/add`,

  logItem: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.item': itemId,
      'filter.in.level': level,
      'page.page': 1,
      'page.size': 1,
      'page.sort': 'log_time,DESC',
    })}`,
  logItems: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.item': itemId,
      'filter.gte.level': level,
    })}`,
  logItemActivity: (activeProject, itemId) => `${urlBase}${activeProject}/activity/item/${itemId}`,
  logAttachment: (activeProject, id) =>
    `${urlBase}${activeProject}/data/${id}${getQueryParams({ access_token: getToken() })}`,

  user: () => `${urlBase}user`,
  userRegistration: () => `${urlBase}user/registration`,
  userPasswordReset: () => `${urlBase}user/password/reset`,
  userPasswordResetToken: (token) => `${urlBase}user/password/reset/${token}`,
  userPasswordRestore: () => `${urlBase}user/password/restore`,
  userChangePassword: () => `${urlBase}user/password/change`,
  userSynchronize: (type) => `${urlBase}uat/sso/me/${type}/synchronize`,
  userInfo: (userId) => `${urlBase}user/${userId}`,
  userInviteInternal: (activeProject) => `${urlBase}project/${activeProject}/assign`,
  userInviteExternal: () => `${urlBase}user/bid`,
  teamMembersSearchUrl: (activeProject) =>
    `${urlBase}project/${activeProject}/usernames?filter.cnt.users=`,
  userUnasign: (activeProject) => `${urlBase}project/${activeProject}/unassign`,

  widget: (activeProject, widgetId) => `${urlBase}${activeProject}/widget/${widgetId}`,
  generateDemoData: (projectId) => `${urlBase}demo/${projectId}`,
};
