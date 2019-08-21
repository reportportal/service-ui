import { stringify } from 'qs';
import { CSV } from 'common/constants/fileTypes';
import { createFilterQuery } from 'components/filterEntities/containers/utils';

export const DEFAULT_API_URL_PREFIX = '/api/v1';
export const UAT_API_URL_PREFIX = '/uat';
export const COMPOSITE_API_URL_PREFIX = '/composite/';

const urlBase = `${DEFAULT_API_URL_PREFIX}/`;
const uatBase = `${UAT_API_URL_PREFIX}/`;
const compositeBase = COMPOSITE_API_URL_PREFIX;
const getQueryParams = (paramsObj) => stringify(paramsObj, { addQueryPrefix: true });

export const URLS = {
  apiDocs: (apiType) => `${apiType}/api-docs`,

  dataPhoto: (at) => `${urlBase}data/photo${getQueryParams({ at })}`,
  dataUserPhoto: (id) => `${urlBase}data/userphoto${getQueryParams({ id })}`,

  dashboard: (activeProject, id) => `${urlBase}${activeProject}/dashboard/${id}`,
  dashboards: (activeProject) => `${urlBase}${activeProject}/dashboard`,
  dashboardsShared: (activeProject) =>
    `${urlBase}${activeProject}/dashboard/shared${getQueryParams({
      'page.page': 1,
      'page.size': 300,
    })}`,

  widget: (activeProject, widgetId = '') => `${urlBase}${activeProject}/widget/${widgetId}`,
  widgetMultilevel: (activeProject, widgetId, params) =>
    `${urlBase}${activeProject}/widget/multilevel/${widgetId}${getQueryParams({
      ...params,
    })}`,
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

  filter: (activeProject, id = '') => `${urlBase}${activeProject}/filter/${id}`,
  filters: (activeProject) => `${urlBase}${activeProject}/filter`,
  filtersSearch: (activeProject) =>
    `${urlBase}${activeProject}/filter?page.sort=name&page.page=1&page.size=50&filter.cnt.name=`,
  launchesFilters: (activeProject, ids = []) =>
    `${urlBase}${activeProject}/filter/filters?ids=${ids.join(',')}`,

  debug: (activeProject) => `${urlBase}${activeProject}/launch/mode`,

  launch: (activeProject, id) => `${urlBase}${activeProject}/launch/${id}`,
  launchStatus: (activeProject, ids) => `${urlBase}${activeProject}/launch/status?ids=${ids}`,
  launchByIds: (activeProject, ids) => `${urlBase}${activeProject}/launch?filter.in.id=${ids}`,
  launchAttributeKeysSearch: (activeProject) =>
    `${urlBase}${activeProject}/launch/attribute/keys?filter.cnt.attributeKey=`,
  launchAttributeValuesSearch: (activeProject, key = '') =>
    `${urlBase}${activeProject}/launch/attribute/values?${
      key ? `filter.eq.attributeKey=${key}&` : ''
    }filter.cnt.attributeValue=`,
  launchNameSearch: (activeProject) => `${urlBase}${activeProject}/launch/names?filter.cnt.name=`,
  launchOwnersSearch: (activeProject) =>
    `${urlBase}${activeProject}/launch/owners?filter.cnt.user=`,
  launches: (activeProject) => `${urlBase}${activeProject}/launch`,
  launchesLatest: (activeProject, ids) =>
    `${urlBase}${activeProject}/launch/latest${getQueryParams({ ids })}`,
  launchUpdate: (activeProject) => `${urlBase}${activeProject}/launch/update`,
  launchesInfoUpdate: (activeProject) => `${urlBase}${activeProject}/launch/info`,
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
    })}`,
  launchAnalyze: (activeProject) => `${urlBase}${activeProject}/launch/analyze`,
  login: () => `${uatBase}sso/oauth/token`,
  apiToken: () => `${uatBase}sso/me/apitoken`,
  sessionToken: () => `${uatBase}sso/me`,

  project: (activeProject) => `${urlBase}project/${activeProject}`,
  addProject: () => `${urlBase}project`,
  projectNames: () => `${urlBase}project/names`,
  searchProjectNames: () => `${urlBase}project/names/search`,
  projectDefectSubType: (activeProject) => `${urlBase}${activeProject}/settings/sub-type`,
  projectDeleteDefectSubType: (activeProject, id) =>
    `${urlBase}${activeProject}/settings/sub-type/${id}`,
  projects: () => `${urlBase}project/list`,
  projectPreferences: (activeProject, userId, filterId = '') =>
    `${urlBase}project/${activeProject}/preference/${userId}/${filterId}`,
  projectUsers: (activeProject) => `${urlBase}project/${activeProject}/users`,
  projectUserSearchUser: (activeProject, input) =>
    `${urlBase}project/${activeProject}/usernames/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'user,ASC',
      term: input,
    })}`,
  projectAddPattern: (activeProject) => `${urlBase}${activeProject}/settings/pattern`,
  projectUpdatePattern: (activeProject, patternId) =>
    `${urlBase}${activeProject}/settings/pattern/${patternId}`,
  projectUsernamesSearch: (activeProject) =>
    `${urlBase}project/${activeProject}/usernames?filter.cnt.users=`,
  projectIndex: (activeProject) => `${urlBase}project/${activeProject}/index`,

  projectStatus: (activeProject, interval) =>
    `${urlBase}project/list/${activeProject}${getQueryParams({
      interval,
    })}`,
  projectSearch: () => `${urlBase}project/list?filter.cnt.name=`,
  projectNameSearch: () => `${urlBase}project/names/search?term=`,

  exportProjects: (filterEntities) =>
    `${urlBase}project/export${getQueryParams({
      view: CSV,
      ...createFilterQuery(filterEntities),
    })}`,
  projectNotificationConfiguration: (activeProject) =>
    `${urlBase}project/${activeProject}/notification`,
  suite: (activeProject, suiteId) => `${urlBase}${activeProject}/item/${suiteId}`,

  testItems: (activeProject, ids) => `${urlBase}${activeProject}/item${getQueryParams({ ids })}`,
  testItem: (activeProject, id = '') => `${urlBase}${activeProject}/item/${id}`,
  testItemUpdate: (activeProject, id = '') => `${urlBase}${activeProject}/item/${id}/update`,
  testItemsHistory: (activeProject, ids, historyDepth) =>
    `${urlBase}${activeProject}/item/history${getQueryParams({
      ids,
      history_depth: historyDepth,
    })}`,
  testItemsInfoUpdate: (activeProject) => `${urlBase}${activeProject}/item/info`,
  testItemsLinkIssues: (activeProject) => `${urlBase}${activeProject}/item/issue/link`,
  testItemsUnlinkIssues: (activeProject) => `${urlBase}${activeProject}/item/issue/unlink`,
  testItemAttributeKeysSearch: (activeProject, launch = '') =>
    `${urlBase}${activeProject}/item/attribute/keys?launch=${launch}&filter.cnt.attributeKey=`,
  testItemAttributeValuesSearch: (activeProject, launch = '', key = '') =>
    `${urlBase}${activeProject}/item/attribute/values?launch=${launch}${
      key ? `&filter.eq.attributeKey=${key}` : ''
    }&filter.cnt.attributeValue=`,

  logItem: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.item': itemId,
      'filter.in.level': level,
      'page.page': 1,
      'page.size': 1,
      'page.sort': 'logTime,DESC',
    })}`,
  logItems: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log/nested/${itemId}${getQueryParams({
      'filter.gte.level': level,
    })}`,
  logsUnderPath: (activeProject, path) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.under.path': path,
    })}`,
  launchLogs: (activeProject, itemId, level) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.eq.launch': itemId,
      'filter.gte.level': level,
    })}`,
  logItemActivity: (activeProject, itemId) => `${urlBase}${activeProject}/activity/item/${itemId}`,
  logItemStackTrace: (activeProject, path, pageSize) =>
    `${urlBase}${activeProject}/log${getQueryParams({
      'filter.under.path': path,
      'page.page': 1,
      'page.size': pageSize,
      'filter.gte.level': 'ERROR',
      'page.sort': 'logTime,DESC',
    })}`,
  logSearch: (activeProject, itemId) => `${urlBase}${activeProject}/log/search/${itemId}`,
  user: () => `${urlBase}user`,
  userRegistration: () => `${urlBase}user/registration`,
  userValidateRegistrationInfo: () => `${urlBase}user/registration/info`,
  userPasswordReset: () => `${urlBase}user/password/reset`,
  userPasswordResetToken: (token) => `${urlBase}user/password/reset/${token}`,
  userPasswordRestore: () => `${urlBase}user/password/restore`,
  userChangePassword: () => `${urlBase}user/password/change`,
  userSynchronize: (type) => `${uatBase}sso/me/${type}/synchronize`,
  userInfo: (userId) => `${urlBase}user/${userId}`,
  userInviteInternal: (activeProject) => `${urlBase}project/${activeProject}/assign`,
  userInviteExternal: () => `${urlBase}user/bid`,
  userUnasign: (activeProject) => `${urlBase}project/${activeProject}/unassign`,

  generateDemoData: (projectId) => `${urlBase}demo/${projectId}`,
  getFileById: (dataId) => `${urlBase}data/${dataId}`,

  serverSettings: () => `${urlBase}settings`,
  emailServerSettings: () => `${urlBase}settings/email`,
  authSettings: (authTypeOrId) => `${uatBase}settings/auth/${authTypeOrId}`,
  githubAuthSettings: () => `${uatBase}settings/oauth/github`,
  statisticsServerSettings: () => `${urlBase}settings/analytics`,
  events: (projectId) => `${urlBase}${projectId}/activity`,
  allUsers: () => `${urlBase}user/all`,
  searchUsers: (term) =>
    `${urlBase}user/search${getQueryParams({
      term,
    })}`,
  exportUsers: (filterEntities) =>
    `${urlBase}user/export${getQueryParams({
      view: 'csv',
      ...createFilterQuery(filterEntities),
    })}`,

  apiInfo: () => `${urlBase}info`,
  compositeInfo: () => `${compositeBase}info`,

  plugin: () => `${urlBase}plugin`,
  pluginUpdate: (pluginId) => `${urlBase}plugin/${pluginId}`,
  globalIntegrationsByPluginName: (pluginName = '') =>
    `${urlBase}integration/global/all/${pluginName}`,
  projectIntegrationByIdCommand: (projectId, integrationId, command) =>
    `${urlBase}integration/${projectId}/${integrationId}/${command}`,
  newProjectIntegration: (projectId, pluginName) =>
    `${urlBase}integration/${projectId}/${pluginName}`,
  newGlobalIntegration: (pluginName) => `${urlBase}integration/${pluginName}`,
  projectIntegration: (projectId, integrationId) =>
    `${urlBase}integration/${projectId}/${integrationId}`,
  globalIntegration: (integrationId) => `${urlBase}integration/${integrationId}`,
  removeProjectIntegrationByType: (projectId, type) =>
    `${urlBase}integration/${projectId}/all/${type}`,
  testIntegrationConnection: (projectId, integrationId) =>
    `${urlBase}integration/${projectId}/${integrationId}/connection/test`,

  btsIntegrationIssueTypes: (projectId, integrationId) =>
    `${urlBase}bts/${projectId}/${integrationId}/issue_types`,
  btsGlobalIntegrationIssueTypes: (integrationId) => `${urlBase}bts/${integrationId}/issue_types`,
  btsIntegrationFieldsSet: (projectId, integrationId, issueType) =>
    `${urlBase}bts/${projectId}/${integrationId}/fields-set?issueType=${issueType}`,
  btsGlobalIntegrationFieldsSet: (integrationId, issueType) =>
    `${urlBase}bts/${integrationId}/fields-set?issueType=${issueType}`,
  btsIntegrationPostTicket: (projectId, integrationId) =>
    `${urlBase}bts/${projectId}/${integrationId}/ticket`,
  btsTicket: (activeProject, issueId, btsProject, btsUrl) =>
    `${urlBase}bts/${activeProject}/ticket/${issueId}${getQueryParams({ btsProject, btsUrl })}`,
};
