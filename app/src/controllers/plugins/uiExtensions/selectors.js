import { createSelector } from 'reselect';
import { enabledPluginNamesSelector } from '../selectors';
import { uiExtensionMap } from './uiExtensionStorage';

export const createUiExtensionSelectorByType = (type) =>
  createSelector(enabledPluginNamesSelector, (pluginNames) =>
    Array.from(uiExtensionMap.entries())
      .filter(([name]) => pluginNames.includes(name))
      .map(([, extensions]) => extensions)
      .reduce((acc, val) => acc.concat(val), [])
      .filter((extension) => extension.type === type),
  );
