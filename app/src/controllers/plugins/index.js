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

export { pluginsReducer } from './reducer';
export { SECRET_FIELDS_KEY } from './constants';
export {
  fetchPluginsAction,
  removePluginAction,
  removePluginSuccessAction,
  updatePluginSuccessAction,
  fetchGlobalIntegrationsAction,
  addIntegrationAction,
  removeIntegrationAction,
  removeProjectIntegrationsByTypeAction,
  updateIntegrationAction,
  setProjectIntegrationsAction,
} from './actionCreators';
export {
  filterAvailablePlugins,
  filterIntegrationsByName,
  groupItems,
  sortItemsByGroupType,
  isPostIssueActionAvailable,
  isAuthorizationPlugin,
  isPluginSwitchable,
} from './utils';
export {
  pluginsSelector,
  availablePluginsSelector,
  availableGroupedPluginsSelector,
  createNamedIntegrationsSelector,
  namedGlobalIntegrationsSelectorsMap,
  namedProjectIntegrationsSelectorsMap,
  availableBtsIntegrationsSelector,
  namedAvailableBtsIntegrationsSelector,
  availableIntegrationsByPluginNameSelector,
  isEmailIntegrationAvailableSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
} from './selectors';
export { pluginSagas } from './sagas';
export {
  uiExtensionSettingsTabsSelector,
  uiExtensionAdminPagesSelector,
  uiExtensionPagesSelector,
  extensionsLoadedSelector,
  uiExtensionHeaderComponentsSelector,
} from './uiExtensions';
