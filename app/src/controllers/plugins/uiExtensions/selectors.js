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

import { createSelector } from 'reselect';
import {
  normalizeExtensionPluginModules,
  normalizeRemotePluginModules,
} from 'controllers/plugins/uiExtensions/utils';
import {
  EXTENSION_TYPE_SETTINGS_TAB,
  EXTENSION_TYPE_ADMIN_PAGE,
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
  EXTENSION_TYPE_ADMIN_SIDEBAR_COMPONENT,
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
  EXTENSION_TYPE_POST_ISSUE_FORM,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
  EXTENSION_TYPE_LOGIN_BLOCK,
  EXTENSION_TYPE_LOGIN_PAGE,
  EXTENSION_TYPE_REGISTRATION_PAGE,
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON,
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON,
  EXTENSION_TYPE_LOG_STACKTRACE_ADDON,
  EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON,
  EXTENSION_TYPE_PROJECT_PAGE,
  PLUGIN_TYPE_REMOTE,
  PLUGIN_TYPE_EXTENSION,
  REMOTE_EXTENSION_POINT_PROJECT_PAGE,
} from './constants';
import {
  domainSelector,
  enabledExternalPluginsSelector,
  enabledExternalPublicPluginsSelector,
} from '../selectors';

const extensionManifestsSelector = (state) =>
  domainSelector(state).uiExtensions.extensionManifests || [];

// Normalize different plugin types extensions to unify their processing in components
const createExtensionSelectorByExtensionPoints = (
  extensionPoints = [],
  pluginsSelector = enabledExternalPluginsSelector,
) =>
  createSelector(pluginsSelector, extensionManifestsSelector, (plugins, manifests) => {
    const extensions = plugins.reduce((acc, { pluginType, details, name }) => {
      let manifest;
      switch (pluginType) {
        case PLUGIN_TYPE_REMOTE:
          return acc.concat(
            normalizeRemotePluginModules(details.modules, {
              pluginName: name,
              url: details.baseUrl,
            }),
          );
        case PLUGIN_TYPE_EXTENSION:
          manifest = manifests.find(({ pluginName }) => pluginName === name);

          if (manifest) {
            return acc.concat(
              normalizeExtensionPluginModules(manifest.extensions, {
                pluginName: name,
                url: manifest.url,
                scope: manifest.scope,
              }),
            );
          }
          return acc;
        default:
          return acc;
      }
    }, []);

    return extensions.filter((extension) => extensionPoints.includes(extension.extensionPoint));
  });

export const uiExtensionSettingsTabsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_SETTINGS_TAB,
]);
export const uiExtensionAdminPagesSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_ADMIN_PAGE,
]);
export const uiExtensionSidebarComponentsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
]);
export const uiExtensionAdminSidebarComponentsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_ADMIN_SIDEBAR_COMPONENT,
]);
export const uiExtensionLaunchItemComponentsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
]);
export const uiExtensionIntegrationFormFieldsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
]);
export const uiExtensionIntegrationSettingsSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
]);
export const uiExtensionPostIssueFormSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_POST_ISSUE_FORM,
]);
export const uniqueErrorGridCellComponentSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
]);
export const uniqueErrorGridHeaderCellComponentSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
]);
export const uiExtensionLoginBlockSelector = createExtensionSelectorByExtensionPoints(
  [EXTENSION_TYPE_LOGIN_BLOCK],
  enabledExternalPublicPluginsSelector,
);
export const uiExtensionLoginPageSelector = createExtensionSelectorByExtensionPoints(
  [EXTENSION_TYPE_LOGIN_PAGE],
  enabledExternalPublicPluginsSelector,
);
export const uiExtensionRegistrationPageSelector = createExtensionSelectorByExtensionPoints(
  [EXTENSION_TYPE_REGISTRATION_PAGE],
  enabledExternalPublicPluginsSelector,
);
export const uiExtensionProjectPagesSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_PROJECT_PAGE,
  REMOTE_EXTENSION_POINT_PROJECT_PAGE,
]);

export const makeDecisionDefectCommentAddonSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON,
]);
export const makeDecisionDefectTypeAddonSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON,
]);
export const logStackTraceAddonSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_LOG_STACKTRACE_ADDON,
]);
export const testItemDetailsAddonSelector = createExtensionSelectorByExtensionPoints([
  EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON,
]);
