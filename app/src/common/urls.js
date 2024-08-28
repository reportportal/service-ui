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

import { stringify } from 'qs';
import { CSV } from 'common/constants/fileTypes';
import { createFilterQuery } from 'components/filterEntities/containers/utils';

export const UAT_API_PATH = '/uat';

export const DEFAULT_API_URL_PREFIX = '../api/v1';
export const DEFAULT_COMMON_API_URL_PREFIX = '../api';
export const UAT_API_URL_PREFIX = '../uat';
export const COMPOSITE_API_URL_PREFIX = '../composite/';

const urlBase = `${DEFAULT_API_URL_PREFIX}/`;
const urlCommonBase = `${DEFAULT_COMMON_API_URL_PREFIX}/`;
const uatBase = `${UAT_API_URL_PREFIX}/`;
const compositeBase = COMPOSITE_API_URL_PREFIX;
const getQueryParams = (paramsObj) => stringify(paramsObj, { addQueryPrefix: true });

export const URLS = {
  apiDocs: (apiType) => `${apiType}/api-docs`,

  dataPhoto: (at, loadThumbnail) => `${urlBase}data/photo${getQueryParams({ at, loadThumbnail })}`,
  dataUserPhoto: (projectKey, login, loadThumbnail) =>
    `${urlBase}data/${projectKey}/userphoto${getQueryParams({ login, loadThumbnail })}`,

  dashboard: (projectKey, id) => `${urlBase}${projectKey}/dashboard/${id}`,
  dashboards: (projectKey, params) =>
    `${urlBase}${projectKey}/dashboard${getQueryParams({ ...params })}`,

  widget: (projectKey, widgetId = '') => `${urlBase}${projectKey}/widget/${widgetId}`,
  widgetMultilevel: (projectKey, widgetId, params) =>
    `${urlBase}${projectKey}/widget/multilevel/${widgetId}${getQueryParams({
      ...params,
    })}`,
  widgetPreview: (projectKey) => `${urlBase}${projectKey}/widget/preview`,

  dashboardWidget: (projectKey, dashboardId, widgetId) =>
    `${urlBase}${projectKey}/dashboard/${dashboardId}/${widgetId}`,

  addDashboardWidget: (projectKey, dashboardId) =>
    `${urlBase}${projectKey}/dashboard/${dashboardId}/add`,

  projectWidget: (projectKey, widgetId = '', interval = '') =>
    `${urlBase}project/${projectKey}/widget/${widgetId}${getQueryParams({ interval })}`,

  filter: (projectKey, id = '') => `${urlBase}${projectKey}/filter/${id}`,
  filters: (projectKey) => `${urlBase}${projectKey}/filter`,
  filtersSearch: (projectKey) =>
    `${urlBase}${projectKey}/filter?page.sort=name&page.page=1&page.size=50&filter.cnt.name=`,
  searchFilterNames: (projectKey) => `${urlBase}${projectKey}/filter/names`,
  launchesFilters: (projectKey, ids = []) =>
    `${urlBase}${projectKey}/filter/filters?ids=${ids.join(',')}`,

  debug: (projectKey) => `${urlBase}${projectKey}/launch/mode`,

  launch: (projectKey, id) => `${urlBase}${projectKey}/launch/${id}`,
  launchStatus: (projectKey, ids) => `${urlBase}${projectKey}/launch/status?ids=${ids}`,
  launchByIds: (projectKey, ids) => `${urlBase}${projectKey}/launch?filter.in.id=${ids}`,
  launchAttributeKeysSearch: (projectKey) => (searchTerm = '') =>
    `${urlBase}${projectKey}/launch/attribute/keys?filter.cnt.attributeKey=${searchTerm}`,
  itemAttributeKeysAllSearch: (projectKey, filterId, isLatest, launchesLimit) => (
    searchTerm = '',
  ) =>
    `${urlBase}${projectKey}/item/attribute/keys/all?filterId=${filterId}&isLatest=${isLatest}&launchesLimit=${launchesLimit}&filter.cnt.attributeKey=${searchTerm}`,
  launchAttributeValuesSearch: (projectKey, key = '') => (searchTerm = '') =>
    `${urlBase}${projectKey}/launch/attribute/values?${
      key ? `filter.eq.attributeKey=${key}&` : ''
    }filter.cnt.attributeValue=${searchTerm}`,
  itemAttributeKeysByLaunchName: (projectKey, launchName) => (searchTerm = '') =>
    `${urlBase}${projectKey}/item/step/attribute/keys${getQueryParams({
      'filter.eq.name': launchName || undefined,
      'filter.cnt.attributeKey': searchTerm,
    })}`,
  itemAttributeValuesByLaunchName: (projectKey, launchName, key) => (searchTerm = '') =>
    `${urlBase}${projectKey}/item/step/attribute/values${getQueryParams({
      'filter.eq.name': launchName || undefined,
      'filter.eq.attributeKey': key || undefined,
      'filter.cnt.attributeValue': searchTerm,
    })}`,
  MLSuggestions: (projectKey, itemId) => `${urlBase}${projectKey}/item/suggest/${itemId}`,
  MLSuggestionsByCluster: (projectKey, clusterId) =>
    `${urlBase}${projectKey}/item/suggest/cluster/${clusterId}`,
  choiceSuggestedItems: (projectKey) => `${urlBase}${projectKey}/item/suggest/choice`,
  launchNameSearch: (projectKey) => (searchTerm = '') =>
    `${urlBase}${projectKey}/launch/names?filter.cnt.name=${searchTerm}`,
  launchesExistingNames: (projectKey) => `${urlBase}${projectKey}/launch/names`,
  launchOwnersSearch: (projectKey) => (searchTerm = '') =>
    `${urlBase}${projectKey}/launch/owners?filter.cnt.user=${searchTerm}`,
  launches: (projectKey, ids = []) => `${urlBase}${projectKey}/launch?ids=${ids.join(',')}`,
  launchesLatest: (projectKey, ids) =>
    `${urlBase}${projectKey}/launch/latest${getQueryParams({ ids })}`,
  launchUpdate: (projectKey) => `${urlBase}${projectKey}/launch/update`,
  singleLaunchUpdate: (projectKey, launchId) => `${urlBase}${projectKey}/launch/${launchId}/update`,
  launchesInfo: (projectKey) => `${urlBase}${projectKey}/launch/info`,
  launchStop: (projectKey) => `${urlBase}${projectKey}/launch/stop`,
  launchesItemsUpdate: (projectKey, id, type) => `${urlBase}${projectKey}/${type}/${id}/update`,
  launchesMerge: (projectKey) => `${urlBase}${projectKey}/launch/merge`,
  launchesCompare: (projectKey, ids) =>
    `${urlBase}${projectKey}/launch/compare${getQueryParams({ ids })}`,

  launchImport: (projectKey) => `${urlBase}${projectKey}/launch/import`,
  exportLaunch: (projectKey, launchId, exportType) =>
    `${urlBase}${projectKey}/launch/${launchId}/report${getQueryParams({
      view: exportType,
    })}`,
  launchAnalyze: (projectKey) => `${urlBase}${projectKey}/launch/analyze`,
  login: () => `${uatBase}sso/oauth/token`,
  sessionToken: () => `${uatBase}sso/me`,

  apiKeys: (userId) => `${urlCommonBase}users/${userId}/api-keys`,
  apiKeyById: (userId, apiKeyId) => `${urlCommonBase}users/${userId}/api-keys/${apiKeyId}`,

  organizationList: (preferencesObj = {}) =>
    `${urlCommonBase}organizations${getQueryParams(preferencesObj)}`,
  organizationProjects: (organizationId, preferencesObj = {}) =>
    `${urlCommonBase}organizations/${organizationId}/projects${getQueryParams(preferencesObj)}`,

  projectByName: (projectKey) => `${urlBase}project/${projectKey}`,
  project: (ids = []) => `${urlBase}project?ids=${ids.join(',')}`,
  projectNames: () => `${urlBase}project/names`,
  searchProjectNames: () => `${urlBase}project/names/search`,
  projectDefectType: (projectKey) => `${urlBase}${projectKey}/settings/sub-type`,
  projectDeleteDefectType: (projectKey, id) => `${urlBase}${projectKey}/settings/sub-type/${id}`,
  projects: () => `${urlBase}project/list`,
  projectPreferences: (projectKey, filterId = '') =>
    `${urlBase}project/${projectKey}/preference/${filterId}`,
  projectUsers: (projectKey) => `${urlBase}project/${projectKey}/users`,
  projectUserSearchUser: (projectKey) => (searchTerm) =>
    `${urlBase}project/${projectKey}/usernames/search${getQueryParams({
      'page.page': 1,
      'page.size': 10,
      'page.sort': 'user,ASC',
      term: searchTerm,
    })}`,
  searchUsers: (term) =>
    `${urlCommonBase}users/search${getQueryParams({
      term,
    })}`,
  projectAddPattern: (projectKey) => `${urlBase}${projectKey}/settings/pattern`,
  projectUpdatePattern: (projectKey, patternId) =>
    `${urlBase}${projectKey}/settings/pattern/${patternId}`,
  projectUsernamesSearch: (projectKey) => (searchTerm = '') =>
    `${urlBase}project/${projectKey}/usernames?filter.cnt.users=${searchTerm}`,
  projectIndex: (projectKey) => `${urlBase}project/${projectKey}/index`,

  projectStatus: (projectKey, interval) =>
    `${urlBase}project/list/${projectKey}${getQueryParams({
      interval,
    })}`,
  projectSearch: () => `${urlBase}project/list?filter.cnt.name=`,
  projectNameSearch: (searchTerm) => `${urlBase}project/names/search?term=${searchTerm}`,

  exportProjects: (filterEntities, sortingEntities = {}) =>
    `${urlBase}project/export${getQueryParams({
      view: CSV,
      ...createFilterQuery(filterEntities),
      ...sortingEntities,
    })}`,
  suite: (projectKey, suiteId) => `${urlBase}${projectKey}/item/${suiteId}`,

  notification: (projectKey) => `${urlBase}${projectKey}/settings/notification`,
  notificationById: (projectKey, notificationId) =>
    `${urlBase}${projectKey}/settings/notification/${notificationId}`,

  testItems: (projectKey, ids) => `${urlBase}${projectKey}/item/${getQueryParams({ ids })}`,
  testItemsWithProviderType: (projectKey, ids) =>
    `${urlBase}${projectKey}/item/v2${getQueryParams({ ids })}`,
  testItem: (projectKey, id = '') => `${urlBase}${projectKey}/item/${id}`,
  testItemStatistics: (projectKey) => `${urlBase}${projectKey}/item/statistics`,
  testItemUpdate: (projectKey, id = '') => `${urlBase}${projectKey}/item/${id}/update`,
  testItemsHistory: (projectKey, historyDepth, type, id) =>
    `${urlBase}${projectKey}/item/history${getQueryParams({
      historyDepth,
      type,
      'filter.eq.id': id,
    })}`,
  testItemsInfo: (projectKey) => `${urlBase}${projectKey}/item/info`,
  testItemsLinkIssues: (projectKey) => `${urlBase}${projectKey}/item/issue/link`,
  testItemsUnlinkIssues: (projectKey) => `${urlBase}${projectKey}/item/issue/unlink`,
  testItemAttributeKeysSearch: (projectKey, launch = '') => (searchTerm = '') =>
    `${urlBase}${projectKey}/item/attribute/keys?launch=${launch}&filter.cnt.attributeKey=${searchTerm}`,
  testItemAttributeValuesSearch: (projectKey, launch = '', key = '') => (searchTerm = '') =>
    `${urlBase}${projectKey}/item/attribute/values?launch=${launch}${
      key ? `&filter.eq.attributeKey=${key}` : ''
    }&filter.cnt.attributeValue=${searchTerm}`,
  testItemBTSIssuesSearch: (projectKey) => (searchTerm = '') =>
    `${urlBase}${projectKey}/item/ticket/ids/all?term=${searchTerm}`,

  logItem: (projectKey, itemId, level) =>
    `${urlBase}${projectKey}/log${getQueryParams({
      'filter.eq.item': itemId,
      'filter.gte.level': level,
      'page.page': 1,
      'page.size': 1,
      'page.sort': 'logTime,DESC',
    })}`,
  logItems: (projectKey, itemId, level) =>
    `${urlBase}${projectKey}/log/nested/${itemId}${getQueryParams({
      'filter.gte.level': level,
    })}`,
  errorLogs: (projectKey, itemId, level) =>
    `${urlBase}${projectKey}/log/locations/${itemId}${getQueryParams({
      'filter.gte.level': level,
    })}`,
  logsUnderPath: (projectKey, path, excludedRetryParentId) =>
    `${urlBase}${projectKey}/log${getQueryParams({
      'filter.under.path': path,
      'filter.!ex.retryParentId': excludedRetryParentId,
    })}`,
  launchLogs: (projectKey, itemId, level) =>
    `${urlBase}${projectKey}/log${getQueryParams({
      'filter.eq.launch': itemId,
      'filter.gte.level': level,
    })}`,
  logItemActivity: (projectKey, itemId) => `${urlBase}${projectKey}/activity/item/${itemId}`,
  logItemStackTrace: (projectKey, path, pageSize) =>
    `${urlBase}${projectKey}/log${getQueryParams({
      'filter.under.path': path,
      'page.page': 1,
      'page.size': pageSize,
      'filter.gte.level': 'ERROR',
      'page.sort': 'logTime,DESC',
    })}`,
  logSearch: (projectKey, itemId) => `${urlBase}${projectKey}/log/search/${itemId}`,
  bulkLastLogs: (projectKey) => `${urlBase}${projectKey}/log/under`,
  users: (ids = []) => `${urlCommonBase}users?ids=${ids.join(',')}`,
  userRegistration: () => `${urlCommonBase}users/registration`,
  userValidateRegistrationInfo: () => `${urlCommonBase}users/registration/info`,
  userPasswordReset: () => `${urlCommonBase}users/password/reset`,
  userPasswordResetToken: (token) => `${urlCommonBase}users/password/reset/${token}`,
  userPasswordRestore: () => `${urlCommonBase}users/password/restore`,
  userChangePassword: () => `${urlCommonBase}users/password/change`,
  userSynchronize: (type) => `${uatBase}sso/me/${type}/synchronize`,
  userInfo: (userId) => `${urlCommonBase}users/${userId}`,
  userInviteInternal: (projectKey) => `${urlBase}project/${projectKey}/assign`,
  userInviteExternal: () => `${urlCommonBase}users/bid`,
  userUnassign: (projectKey) => `${urlBase}project/${projectKey}/unassign`,

  generateDemoData: (projectKey) => `${urlBase}demo/${projectKey}/generate`,
  getFileById: (projectKey, dataId, loadThumbnail) =>
    `${urlBase}data/${projectKey}/${dataId}${getQueryParams({ loadThumbnail })}`,

  authSettings: (authTypeOrId, id = '') => `${uatBase}settings/auth/${authTypeOrId}/${id}`,
  githubAuthSettings: () => `${uatBase}settings/oauth/github`,
  analyticsServerSettings: () => `${urlBase}settings/analytics`,
  events: () => `${urlBase}activities/searches`,
  searchEventsBySubjectName: (projectName) => (searchTerm = '') =>
    `${urlBase}activities/${projectName}/subjectName?filter.cnt.subjectName=${searchTerm}`,
  allUsers: () => `${urlCommonBase}users/all`,

  exportUsers: (filterEntities) =>
    `${urlCommonBase}users/export${getQueryParams({
      view: 'csv',
      ...createFilterQuery(filterEntities),
    })}`,

  appInfo: () => `${compositeBase}info`,

  plugin: () => `${urlBase}plugin`,
  pluginById: (pluginId) => `${urlBase}plugin/${pluginId}`,
  pluginPublic: () => `${urlBase}plugin/public`,
  pluginPublicFile: (pluginName, fileKey) =>
    `${urlBase}plugin/public/${pluginName}/file/${fileKey}`,
  pluginCommandCommon: (projectKey, pluginName, command) =>
    `${urlBase}plugin/${projectKey}/${pluginName}/common/${command}`,
  pluginCommandPublic: (pluginName, command) => `${urlBase}plugin/public/${pluginName}/${command}`,
  globalIntegrationsByPluginName: (pluginName = '') =>
    `${urlBase}integration/global/all/${pluginName}`,
  projectIntegrationByIdCommand: (projectKey, integrationId, command) =>
    `${urlBase}integration/${projectKey}/${integrationId}/${command}`,
  newProjectIntegration: (projectKey, pluginName) =>
    `${urlBase}integration/${projectKey}/${pluginName}`,
  newGlobalIntegration: (pluginName) => `${urlBase}integration/${pluginName}`,
  projectIntegration: (projectKey, integrationId) =>
    `${urlBase}integration/${projectKey}/${integrationId}`,
  globalIntegration: (integrationId) => `${urlBase}integration/${integrationId}`,
  removeProjectIntegrationByType: (projectKey, type) =>
    `${urlBase}integration/${projectKey}/all/${type}`,
  testIntegrationConnection: (projectKey, integrationId) =>
    `${urlBase}integration/${projectKey}/${integrationId}/connection/test`,
  testGlobalIntegrationConnection: (integrationId) =>
    `${urlBase}integration/${integrationId}/connection/test`,
  pluginFileImport: (projectKey, pluginName) =>
    `${urlBase}plugin/${projectKey}/${pluginName}/import`,

  btsIntegrationIssueTypes: (projectKey, integrationId) =>
    `${urlBase}bts/${projectKey}/${integrationId}/issue_types`,
  btsGlobalIntegrationIssueTypes: (integrationId) => `${urlBase}bts/${integrationId}/issue_types`,
  btsIntegrationFieldsSet: (projectKey, integrationId, issueType) =>
    `${urlBase}bts/${projectKey}/${integrationId}/fields-set?issueType=${issueType}`,
  btsGlobalIntegrationFieldsSet: (integrationId, issueType) =>
    `${urlBase}bts/${integrationId}/fields-set?issueType=${issueType}`,
  btsIntegrationPostTicket: (projectKey, integrationId) =>
    `${urlBase}bts/${projectKey}/${integrationId}/ticket`,
  btsTicket: (projectKey, issueId, btsProject, btsUrl) =>
    `${urlBase}bts/${projectKey}/ticket/${issueId}${getQueryParams({ btsProject, btsUrl })}`,
  runUniqueErrorAnalysis: (projectKey) => `${urlBase}${projectKey}/launch/cluster`,
  clusterByLaunchId: (projectKey, launchId, query) =>
    `${urlBase}${projectKey}/launch/cluster/${launchId}${getQueryParams(query)}`,
  onboarding: (page = 'GENERAL') => `${urlBase}onboarding?page=${page}`,
};
