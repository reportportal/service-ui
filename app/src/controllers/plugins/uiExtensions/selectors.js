import { createSelector } from 'reselect';
import {
  EXTENSION_TYPE_SETTINGS_TAB,
  EXTENSION_TYPE_ADMIN_PAGE,
  EXTENSION_TYPE_PAGE,
  EXTENSION_TYPE_HEADER_COMPONENT,
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
export const uiExtensionHeaderComponentsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_HEADER_COMPONENT,
);
