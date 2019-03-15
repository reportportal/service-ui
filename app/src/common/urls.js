import { stringify } from 'qs';
import { getStorageItem } from 'common/utils';
import { TOKEN_KEY } from 'controllers/auth';

export const DEFAULT_API_URL_PREFIX = '/api/v1/';
export const UAT_API_URL_PREFIX = '/uat/';

const urlBase = DEFAULT_API_URL_PREFIX;
const uatBase = UAT_API_URL_PREFIX;
const getToken = () => (getStorageItem(TOKEN_KEY) || {}).value;
const getQueryParams = (paramsObj) => stringify(paramsObj, { addQueryPrefix: true });

export const URLS = {
  apiDocs: (apiType) => `${apiType}api-docs`,

  dataPhoto: (at) => `${urlBase}data/photo${getQueryParams({ at, access_token: getToken() })}`,
  dataUserPhoto: (id) =>
    `${urlBase}data/userphoto${getQueryParams({ id, access_token: getToken() })}`,

  dashboard: (activeProject, id) => `${urlBase}${activeProject}/dashboard/${id}`,
  dashboards: (activeProject) => `${urlBase}${activeProject}/dashboard`,
  dashboardsShared: (activeProject) =>
    `${urlBase}${activeProject}/dashboard/shared${getQueryParams({
      'page.page': 1,
      'page.size': 300,
    })}`,

  widget: (activeProject, widgetId = '') => `${urlBase}${activeProject}/widget/${widgetId}`,
  widgetPreview: (activeProject) => `${urlBase}${activeProject}/widget/preview`,
  sharedWidget: (activeProject, params) =>
    `${urlBase}${activeProject}/widget/shared${getQueryParams({
      ...params,
    })}`,
  sharedWidgetSearch: (activeProject, params) =>
    `${urlBase}${activeProject}/widget/shared/search${getQueryParams({
      ...params,
    })}`,

  dashboardWidget: (activeProject, dashboardId, widgetId) =>
    `${urlBase}${activeProject}/dashboard/${dashboardId}/${widgetId}`,

  addDashboardWidget: (activeProject, dashboardId) =>
    `${urlBase}${activeProject}/dashboard/${dashboardId}/add`,

  projectWidget: (activeProject, widgetId = '', interval = '') =>
    `${urlBase}project/${activeProject}/widget/${widgetId}${getQueryParams({ interval })}`,

  externalSystemIssue: (activeProject, systemId, issueId) =>
    `${urlBase}${activeProject}/external-system/${systemId}/ticket/${issueId}`,

  filter: (activeProject, id = '') => `${urlBase}${activeProject}/filter/${id}`,
  filters: (activeProject) => `${urlBase}${activeProject}/filter`,
  filtersSearch: (activeProject) =>
    `${urlBase}${activeProject}/filter?page.sort=name&page.page=1&page.size=50&filter.cnt.name=`,
  launchesFilters: (activeProject, ids = []) =>
    `${urlBase}${activeProject}/filter/filters?ids=${ids.join(',')}`,

  debug: (activeProject) => `${urlBase}${activeProject}/launch/mode`,

  launch: (activeProject, id) => `${urlBase}${activeProject}/launch/${id}`,
  launchAttributeKeysSearch: (activeProject) =>
    `${urlBase}${activeProject}/launch/attribute/keys?filter.cnt.attributeKey=`,
  launchAttributeValuesSearch: (activeProject, key = '') =>
    `${urlBase}${activeProject}/launch/attribute/values?${
      key ? `filter.eq.attributeKey=${key}&` : ''
    }filter.cnt.attributeValue=`,
  launchTagsSearch: (activeProject) => `${urlBase}${activeProject}/launch/tags?filter.cnt.tags=`,
  launchNameSearch: (activeProject) => `${urlBase}${activeProject}/launch/names?filter.cnt.name=`,
  launchOwnersSearch: (activeProject) =>
    `${urlBase}${activeProject}/launch/owners?filter.cnt.user=`,
  launches: (activeProject, ids) => `${urlBase}${activeProject}/launch${getQueryParams({ ids })}`,
  launchesLatest: (activeProject, ids) =>
    `${urlBase}${activeProject}/launch/latest${getQueryParams({ ids })}`,
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
  launchAnalyze: (activeProject) => `${urlBase}${activeProject}/launch/analyze`,
  login: (grantType, username, password) =>
    `${uatBase}sso/oauth/token${getQueryParams({
      grant_type: grantType,
      username,
      password,
    })}`,
  apiToken: () => `${uatBase}sso/me/apitoken`,
  sessionToken: () => `${urlBase}uat/sso/me`,

  project: (activeProject) => `${urlBase}project/${activeProject}`,
  projectPreferences: (activeProject, userId, filterId = '') =>
    `${urlBase}project/${activeProject}/preference/${userId}/${filterId}`,
  projectUsers: (activeProject) => `${urlBase}project/${activeProject}/users`,
  projectAdminSearchUser: (input) =>
    `${urlBase}user/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'user,ASC',
      term: input,
    })}`,
  projectUserSearchUser: (activeProject, input) =>
    `${urlBase}project/${activeProject}/usernames/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'user,ASC',
      term: input,
    })}`,
  projectUsernamesSearch: (activeProject) =>
    `${urlBase}project/${activeProject}/usernames?filter.cnt.users=`,
  projectIndex: (activeProject) => `${urlBase}project/${activeProject}/index`,

  projectStatus: (activeProject, interval) =>
    `${urlBase}project/list/${activeProject}${getQueryParams({
      interval,
    })}`,

  projectNotificationConfiguration: (activeProject) =>
    `${urlBase}project/${activeProject}/notification`,
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
      'page.sort': 'logTime,DESC',
    })}`,
  logItems: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.item': itemId,
      'filter.gte.level': level,
    })}`,
  logItemActivity: (activeProject, itemId) => `${urlBase}${activeProject}/activity/item/${itemId}`,
  logItemStackTrace: (activeProject, itemId) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.item': itemId,
      'page.page': 1,
      'page.size': 1,
      'filter.in.level': 'ERROR',
      'page.sort': 'logTime,DESC',
    })}`,
  logItemStackTraceMessageLocation: (activeProject, itemId, stackTraceItemId, pageSize, level) =>
    `${urlBase}${activeProject}/log/${stackTraceItemId}/page${getQueryParams({
      'filter.eq.item': itemId,
      'page.page': 1,
      'page.size': pageSize,
      'filter.gte.level': level,
      'page.sort': 'logTime,ASC',
    })}`,

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
  userUnasign: (activeProject) => `${urlBase}project/${activeProject}/unassign`,

  generateDemoData: (projectId) => `${urlBase}demo/${projectId}`,
  getFileById: (dataId) =>
    `${urlBase}data/${dataId}${getQueryParams({ access_token: getToken() })}`,

  serverSettings: () => `${urlBase}settings`,
  emailServerSettings: () => `${urlBase}settings/email`,
  authSettings: (authTypeOrId) => `${uatBase}settings/auth/${authTypeOrId}`,
  githubAuthSettings: () => `${uatBase}settings/oauth/github`,
  statisticsServerSettings: () => `${urlBase}settings/analytics`,
  events: (projectId) => `${urlBase}${projectId}/activity`,
  allUsers: () => `${urlBase}user/all`,
  exportUsers: () =>
    `${urlBase}user/export${getQueryParams({
      view: 'csv',
      access_token: getToken(),
    })}`,
  usersBulkOperations: (ids) => `${urlBase}user/all${getQueryParams({ ids })}`,
};
