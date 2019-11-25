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

export const PLUGINS_PAGE = 'plugins';

export const getPluginFilterTabClickEvent = (tabKey) => ({
  category: PLUGINS_PAGE,
  action: `Click on tab ${tabKey} in Plugins`,
  label: `Open tab ${tabKey} in Plugins`,
});
export const getPluginItemClickEvent = (pluginName) => ({
  category: PLUGINS_PAGE,
  action: `Click on ${pluginName} plugin in Plugins`,
  label: `Open page with info for ${pluginName} plugin in Plugins`,
});
export const getDisablePluginItemClickEvent = (pluginName) => ({
  category: PLUGINS_PAGE,
  action: `Click on ${pluginName} plugin enabled switcher`,
  label: `Disable ${pluginName} plugin`,
});
export const getUninstallPluginBtnClickEvent = (pluginName) => ({
  category: PLUGINS_PAGE,
  action: `Click on Btn uninstall plugin for ${pluginName}`,
  label: `Arise Modal uninstall plugin for ${pluginName}`,
});

const PLUGINS_MODAL = 'Modal plugins';
export const PLUGINS_PAGE_EVENTS = {
  CLICK_UPLOAD_BTN: {
    category: PLUGINS_MODAL,
    action: 'Click on Btn Upload',
    label: 'Arise Modal Upload Plugin',
  },
  OK_BTN_UPLOAD_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Btn Ok on Modal "Upload plugins"',
    label: 'Upload Plugins',
  },
  CANCEL_BTN_UPLOAD_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Btn Cancel on Modal "Upload plugins"',
    label: 'Close Modal Upload Plugins',
  },
  CLOSE_ICON_UPLOAD_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Close Icon on Modal "Upload plugin"',
    label: 'Close Modal Upload plugin',
  },
  STORE_TAB: {
    category: PLUGINS_PAGE,
    action: 'Click on tab Store in Plugins',
    label: 'Open tab Store in Plugins',
  },
  INSTALLED_TAB: {
    category: PLUGINS_PAGE,
    action: 'Click on tab Installed in Plugins',
    label: 'Open tab Installed in Plugins',
  },

  CLOSE_ICON_UNINSTALL_PLUGIN_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Close Icon on Modal "Uninstall Plugin"',
    label: 'Close Modal Uninstall Plugin',
  },
  CANCEL_BTN_UNINSTALL_PLUGIN_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Btn Cancel on Modal "Uninstall Plugin"',
    label: 'Close Modal Uninstall Plugin',
  },
  OK_BTN_UNINSTALL_PLUGIN_MODAL: {
    category: PLUGINS_MODAL,
    action: 'Click on Btn Uninstall on Modal "Uninstall Plugin"',
    label: 'Uninstall Plugin',
  },
};
