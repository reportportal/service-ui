import { createSelector } from 'reselect';
import {
  EXTENSION_TYPE_SETTINGS_TAB,
  EXTENSION_TYPE_ADMIN_PAGE,
  EXTENSION_TYPE_PAGE,
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
  EXTENSION_TYPE_POST_ISSUE_FORM,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
  EXTENSION_TYPE_LOGIN_PAGE,
} from './constants';
import {
  domainSelector,
  enabledPluginNamesSelector,
  enabledPublicPluginNamesSelector,
} from '../selectors';
import { uiExtensionMap } from './uiExtensionStorage';

export const extensionsLoadedSelector = (state) =>
  domainSelector(state).uiExtensions.uiExtensionsLoaded;

const extensionsMetadataSelector = (state) =>
  domainSelector(state).uiExtensions.extensionsMetadata || [];

export const createExtensionSelectorByType = (type) =>
  createSelector(
    enabledPluginNamesSelector,
    extensionsMetadataSelector,
    extensionsLoadedSelector,
    (pluginNames, extensionsMetadata) => {
      // TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
      const uiExtensions = Array.from(uiExtensionMap.entries())
        .filter(([name]) => pluginNames.includes(name))
        .map(([, extensions]) => extensions);

      const newExtensions = extensionsMetadata
        .filter(({ pluginName }) => pluginNames.includes(pluginName))
        .map(({ pluginName, scope, extensions }) =>
          extensions.map((ext) => ({ ...ext, pluginName, scope })),
        );

      return uiExtensions
        .concat(newExtensions)
        .reduce((acc, val) => acc.concat(val), [])
        .filter((extension) => extension.type === type);
    },
  );

export const createPublicExtensionSelectorByType = (type) =>
  createSelector(
    enabledPublicPluginNamesSelector,
    extensionsMetadataSelector,
    (pluginNames, extensionsMetadata) => {
      const newExtensions = extensionsMetadata
        .filter(({ pluginName }) => pluginNames.includes(pluginName))
        .map(({ pluginName, scope, extensions }) =>
          extensions.map((ext) => ({ ...ext, pluginName, scope })),
        );

      return newExtensions
        .reduce((acc, val) => acc.concat(val), [])
        .filter((extension) => extension.type === type);
    },
  );

export const uiExtensionSettingsTabsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_SETTINGS_TAB,
);
export const uiExtensionAdminPagesSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_ADMIN_PAGE,
);
export const uiExtensionPagesSelector = createExtensionSelectorByType(EXTENSION_TYPE_PAGE);
export const uiExtensionSidebarComponentsSelector = createExtensionSelectorByType(
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
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
export const uiExtensionLoginPageSelector = createPublicExtensionSelectorByType(
  EXTENSION_TYPE_LOGIN_PAGE,
);
