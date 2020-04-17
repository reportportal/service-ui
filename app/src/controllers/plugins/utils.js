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

import { URLS } from 'common/urls';
import { GROUP_TYPES_BY_PLUGIN_NAMES_MAP } from 'common/constants/pluginNames';
import { AUTHORIZATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';

export const filterIntegrationsByName = (integrations, integrationName) =>
  integrations.filter((integration) => integration.integrationType.name === integrationName);

export const sortItemsByGroupType = (items) =>
  items.sort((a, b) => {
    const groupTypeA = a.groupType || a.integrationType.groupType;
    const groupTypeB = b.groupType || b.integrationType.groupType;
    return groupTypeA.localeCompare(groupTypeB);
  });

export const groupItems = (items) =>
  items.reduce((accum, item) => {
    const groupType = item.groupType || item.integrationType.groupType;
    const groupedItems = { ...accum };
    if (!groupedItems[groupType]) {
      groupedItems[groupType] = [item];
    } else {
      groupedItems[groupType].push(item);
    }
    return groupedItems;
  }, {});

export const isAuthorizationPlugin = (name) =>
  GROUP_TYPES_BY_PLUGIN_NAMES_MAP[name] === AUTHORIZATION_GROUP_TYPE;

export const resolveIntegrationUrl = (integrationUrl, pluginName) =>
  isAuthorizationPlugin(pluginName) ? URLS.authSettings(pluginName) : integrationUrl;

export const isPostIssueActionAvailable = (integrations) =>
  integrations.length &&
  integrations.some(
    (item) =>
      item.integrationParameters.defectFormFields &&
      item.integrationParameters.defectFormFields.length,
  );

export const isPluginSwitchable = (pluginName) => !isAuthorizationPlugin(pluginName);

export const filterEnabledPlugins = (plugins = []) => plugins.filter((item) => item.enabled);

export const filterAvailablePlugins = (plugins = []) =>
  plugins.filter(
    (item) =>
      item.enabled &&
      item.groupType !== AUTHORIZATION_GROUP_TYPE &&
      GROUP_TYPES_BY_PLUGIN_NAMES_MAP[item.name] === item.groupType,
  );
