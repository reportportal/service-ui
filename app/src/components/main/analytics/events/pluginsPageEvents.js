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

import { getBasicClickEventParameters, normalizeEventParameter } from './common/ga4Utils';

export const PLUGINS_PAGE = 'plugins';

const BASIC_PLUGINS_EVENT_PARAMS = getBasicClickEventParameters(PLUGINS_PAGE);

export const PLUGINS_PAGE_EVENTS = {
  // GA 4
  CLICK_UPLOAD_BTN: {
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'upload',
    place: 'instance_plugins_page',
  },
  availablePluginDetailPageView: (pluginName) => ({
    action: 'page_view',
    page: PLUGINS_PAGE,
    place: `plugin_detail_view_${normalizeEventParameter(pluginName)}`,
  }),
  clickInstallAvailablePlugin: (pluginName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'install',
    place: 'plugin_detail_view',
    type: normalizeEventParameter(pluginName),
  }),
  clickDiscoverPremium: (pluginName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'discover_premium',
    place: 'plugin_detail_view',
    type: normalizeEventParameter(pluginName),
  }),
  clickPremiumModalNotNow: {
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'not_now',
    place: 'premium_features_popup',
    type: 'plugins',
  },
  clickPremiumModalExplorePlans: {
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'explore_plans',
    place: 'premium_features_popup',
    type: 'plugins',
  },
  clickPremiumModalContactUs: {
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'start_contact_us_plugins',
    place: 'premium_features_popup',
    type: 'plugins',
  },
  clickUploadModalBtn: (type) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'upload',
    modal: 'upload_plugin',
    type,
  }),
  clickCreateGlobalIntegration: (type) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'button_create',
    modal: 'create_global_integration',
    type: normalizeEventParameter(type),
  }),
  clickEditGlobalIntegration: (type) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'save',
    modal: 'edit_global_integration',
    type: normalizeEventParameter(type),
  }),
  clickCreateLdapIntegration: (isFullName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'button_create',
    modal: 'create_global_integration',
    type: 'ldap',
    condition: isFullName ? 'full_name' : 'first_last_name',
  }),
  clickEditLdapIntegration: (isFullName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'save',
    modal: 'edit_global_integration',
    type: 'ldap',
    condition: isFullName ? 'full_name' : 'first_last_name',
  }),
  integrationAddClickEvent: (type) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'add_integration',
    type: normalizeEventParameter(type),
  }),
  navigatedInPluginsFilterList: (filterName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: normalizeEventParameter(filterName),
  }),
  clickConfirmUninstallPlugin: (pluginName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'uninstall',
    modal: 'uninstall_plugin',
    type: normalizeEventParameter(pluginName),
  }),
  clickDisablePlugin: (pluginName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'disable',
    modal: 'disable_plugin',
    type: normalizeEventParameter(pluginName),
  }),
  clickEnablePlugin: (pluginName) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'enable',
    modal: 'enable_plugin',
    type: normalizeEventParameter(pluginName),
  }),
  pluginConfigureClickSubmit: (type) => ({
    ...BASIC_PLUGINS_EVENT_PARAMS,
    element_name: 'submit',
    place: 'configuration_view',
    type,
  }),
};
