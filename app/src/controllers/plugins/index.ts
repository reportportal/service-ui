/*
 * Copyright 2025 EPAM Systems
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
export { SECRET_FIELDS_KEY, MARKETPLACE_CATALOGUE_STATE, REGISTRY_STATUS } from './constants';
export {
  fetchPluginsAction,
  fetchPublicPluginsAction,
  removePluginAction,
  removePluginSuccessAction,
  updatePluginSuccessAction,
  fetchGlobalIntegrationsAction,
  addIntegrationAction,
  removeIntegrationAction,
  removeProjectIntegrationsByTypeAction,
  removeOrganizationIntegrationsByTypeAction,
  updateIntegrationAction,
  setProjectIntegrationsAction,
  setOrganizationIntegrationsAction,
  fetchMarketplaceCatalogueAction,
  installMarketplacePluginAction,
  clearJustInstalledMarketplacePluginAction,
  fetchMarketplacePluginDetailAction,
  fetchMarketplaceLicenceAction,
  setMarketplaceLicenceAction,
  deleteMarketplaceLicenceAction,
} from './actionCreators';
export {
  filterAvailablePlugins,
  filterIntegrationsByName,
  groupItems,
  sortItemsByGroupType,
  isPostIssueActionAvailable,
} from './utils';
export { isPluginSupportsCommonCommand } from './uiExtensions/utils';
export {
  pluginsSelector,
  pluginByNameSelector,
  enabledPluginSelector,
  isEpamPluginEnabledSelector,
  availablePluginsSelector,
  availableGroupedPluginsSelector,
  createNamedIntegrationsSelector,
  namedGlobalIntegrationsSelector,
  namedProjectIntegrationsSelector,
  namedOrganizationIntegrationsSelector,
  availableBtsIntegrationsSelector,
  namedAvailableBtsIntegrationsSelector,
  availableIntegrationsByPluginNameSelector,
  isEmailIntegrationAvailableSelector,
  isBtsPluginsExistSelector,
  enabledBtsPluginsSelector,
  enabledImportPluginsSelector,
  isImportPluginsAvailableSelector,
  globalIntegrationsSelector,
  pluginsLoadingSelector,
  organizationPluginSelector,
  marketplaceCatalogueStateSelector,
  marketplaceInstalledPluginsSelector,
  marketplaceAvailablePluginsSelector,
  marketplaceRegistrySelector,
  marketplaceRegistryHostSelector,
  marketplaceCatalogueLoadingSelector,
  isMarketplaceRegistryOfflineSelector,
  hasMarketplaceCatalogueFailedSelector,
  marketplaceCatalogueErrorSelector,
  marketplacePluginUpdateVersionSelector,
  hasMarketplacePluginUpdateSelector,
  isMarketplacePluginInstallingSelector,
  marketplaceCatalogueQuerySelector,
  justInstalledMarketplacePluginSelector,
  isPluginUploadAllowedSelector,
  marketplacePluginDetailStateSelector,
  marketplacePluginDetailLoadingSelector,
  isMarketplacePluginDetailOfflineSelector,
  hasMarketplacePluginDetailFailedSelector,
  marketplacePluginDetailRegistryHostSelector,
  marketplacePluginDetailDataSelector,
  isMarketplaceLicenceConfiguredSelector,
  marketplaceLicenceCustomerIdSelector,
  marketplaceLicenceLoadingSelector,
} from './selectors';
export { pluginSagas } from './sagas';
export {
  uiExtensionSettingsTabsSelector,
  uiExtensionOrganizationSettingsTabsSelector,
  uiExtensionAdminPagesSelector,
  uiExtensionSidebarComponentsSelector,
  uiExtensionOrganizationSidebarComponentsSelector,
  uiExtensionLaunchItemComponentsSelector,
  uiExtensionIntegrationSettingsSelector,
  uiExtensionIntegrationFormFieldsSelector,
  uiExtensionPostIssueFormSelector,
  extensionManifestsLoadPendingSelector,
} from './uiExtensions';
export type {
  Plugin,
  PluginDetails,
  PluginBinaryData,
  PluginDeveloper,
  PluginMetadata,
  PluginRuleField,
  Integration,
  IntegrationType,
} from './types';
