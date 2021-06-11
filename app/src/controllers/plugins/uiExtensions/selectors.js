import { createSelector } from 'reselect';
import {
  EXTENSION_TYPE_SETTINGS_TAB,
  EXTENSION_TYPE_ADMIN_PAGE,
  EXTENSION_TYPE_PAGE,
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
} from './constants';
import { domainSelector, enabledPluginNamesSelector } from '../selectors';
import { uiExtensionMap } from './uiExtensionStorage';

export const extensionsLoadedSelector = (state) =>
  domainSelector(state).uiExtensions.uiExtensionsLoaded;

export const createUiExtensionSelectorByType = (type) =>
  createSelector(enabledPluginNamesSelector, extensionsLoadedSelector, (pluginNames) =>
    Array.from(uiExtensionMap.entries())
      .filter(([name]) => pluginNames.includes(name))
      .map(([, extensions]) => extensions)
      .reduce((acc, val) => acc.concat(val), [])
      .filter((extension) => extension.type === type),
  );

export const uiExtensionSettingsTabsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_SETTINGS_TAB,
);
export const uiExtensionAdminPagesSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_ADMIN_PAGE,
);
export const uiExtensionPagesSelector = createUiExtensionSelectorByType(EXTENSION_TYPE_PAGE);
export const uiExtensionSidebarComponentsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
);
export const uiExtensionLaunchItemComponentsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
);
export const uiExtensionIntegrationFormFieldsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
);
export const uiExtensionIntegrationSettingsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
);
