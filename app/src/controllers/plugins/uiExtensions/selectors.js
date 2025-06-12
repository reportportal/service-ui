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
  PLUGIN_TYPE_CORE,
} from './constants';
import {
  domainSelector,
  enabledPluginNamesSelector,
  enabledPublicPluginNamesSelector,
} from '../selectors';

const extensionManifestsSelector = (state) =>
  domainSelector(state).uiExtensions.extensionManifests || [];

const createExtensionSelectorByType = (type, pluginNamesSelector = enabledPluginNamesSelector) =>
  createSelector(
    pluginNamesSelector,
    extensionManifestsSelector,
    (enabledPluginNames, extensionManifests) => {
      // TODO: update 'pluginType' usage once the backend for remote and core plugins will be ready
      const uiExtensions = extensionManifests
        .filter(
          ({ pluginName, pluginType }) =>
            enabledPluginNames.includes(pluginName) ||
            pluginType === PLUGIN_TYPE_REMOTE ||
            pluginType === PLUGIN_TYPE_CORE,
        )
        .reduce(
          (acc, { extensions, ...commonManifestProperties }) =>
            acc.concat(extensions.map((ext) => ({ ...ext, ...commonManifestProperties }))),
          [],
        );

      return uiExtensions.filter((extension) => extension.type === type);
    },
  );

export const uiExtensionSettingsTabsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_SETTINGS_TAB,
);
export const uiExtensionAdminPagesSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_ADMIN_PAGE,
);
export const uiExtensionSidebarComponentsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
);
export const uiExtensionAdminSidebarComponentsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_ADMIN_SIDEBAR_COMPONENT,
);
export const uiExtensionLaunchItemComponentsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
);
export const uiExtensionIntegrationFormFieldsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
);
export const uiExtensionIntegrationSettingsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
);
export const uiExtensionPostIssueFormSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_POST_ISSUE_FORM,
);
export const uniqueErrorGridCellComponentSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
);
export const uniqueErrorGridHeaderCellComponentSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
);
export const uiExtensionLoginBlockSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_LOGIN_BLOCK,
  enabledPublicPluginNamesSelector,
);
export const uiExtensionLoginPageSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_LOGIN_PAGE,
  enabledPublicPluginNamesSelector,
);
export const uiExtensionRegistrationPageSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_REGISTRATION_PAGE,
  enabledPublicPluginNamesSelector,
);
export const uiExtensionProjectPagesSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_PROJECT_PAGE,
);

export const makeDecisionDefectCommentAddonSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON,
);
export const makeDecisionDefectTypeAddonSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON,
);
export const logStackTraceAddonSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_LOG_STACKTRACE_ADDON,
);
export const testItemDetailsAddonSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON,
);
