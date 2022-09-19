import { select, call, all, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { PUBLIC_PLUGINS, PUBLIC_PLUGIN_ACCESS_TYPE } from 'controllers/plugins/constants';
import { activeProjectKeySelector } from 'controllers/user';
import { COMMAND_GET_FILE, METADATA_FILE_KEY, MAIN_FILE_KEY } from './constants';
import { pluginsSelector, globalIntegrationsSelector, publicPluginsSelector } from '../selectors';
import { filterIntegrationsByName, isPluginSupportsCommonCommand } from '../utils';
import {
  extensionLoadFinishAction,
  extensionLoadStartAction,
  fetchExtensionsMetadataSuccessAction,
} from './actions';

export function* fetchExtensionsMetadata(action) {
  const isPublicPluginNamespace = action && action.meta.namespace === PUBLIC_PLUGINS;
  const plugins = yield select(isPublicPluginNamespace ? publicPluginsSelector : pluginsSelector);
  const uiExtensionPlugins = plugins.filter(
    (plugin) =>
      plugin.enabled &&
      plugin.details &&
      plugin.details.binaryData &&
      plugin.details.binaryData[METADATA_FILE_KEY] &&
      plugin.details.binaryData[MAIN_FILE_KEY],
  );

  if (!uiExtensionPlugins.length) {
    return;
  }

  // TODO: discuss with BE whether we can fetch plugins metadata via single API call
  const calls = uiExtensionPlugins.map((plugin) => {
    const isPluginPublic = plugin.details.accessType === PUBLIC_PLUGIN_ACCESS_TYPE;
    const metadataFile = plugin.details.binaryData[METADATA_FILE_KEY];
    return call(
      fetch,
      isPluginPublic
        ? URLS.pluginPublicFile(plugin.name, metadataFile)
        : URLS.pluginFile(plugin.name, metadataFile),
      {
        contentType: 'application/json',
      },
    );
  });

  if (calls.length === 0) {
    return;
  }

  try {
    const results = yield all(calls);
    const metadataArray = results.map((metadata, index) => ({
      ...metadata,
      pluginName: uiExtensionPlugins[index].name,
      isPublic: uiExtensionPlugins[index].details.accessType === PUBLIC_PLUGIN_ACCESS_TYPE,
    }));

    yield put(fetchExtensionsMetadataSuccessAction(metadataArray));
  } catch (err) {
    console.error('Plugins metadata load error'); // eslint-disable-line no-console
  }
}

// TODO: remove legacy extensions when all existing plugins will be migrated to the new engine
export function* fetchUiExtensions() {
  yield call(fetchExtensionsMetadata);
  // TODO: In the future plugins with js parts should not depend on integrations, only on plugins.
  // TODO: This should be removed when common getFile plugin command will be presented in all plugins with js files.
  const globalIntegrations = yield select(globalIntegrationsSelector);
  if (!globalIntegrations.length) {
    return;
  }

  const plugins = yield select(pluginsSelector);
  const uiExtensionPlugins = plugins.filter(
    (plugin) =>
      plugin.enabled &&
      plugin.details &&
      plugin.details.binaryData &&
      plugin.details.binaryData[MAIN_FILE_KEY] &&
      (isPluginSupportsCommonCommand(plugin, COMMAND_GET_FILE) ||
        plugin.details.allowedCommands.includes(COMMAND_GET_FILE)),
  );
  const projectKey = yield select(activeProjectKeySelector);
  const calls = uiExtensionPlugins
    .map((plugin) => {
      const isCommonCommandSupported = isPluginSupportsCommonCommand(plugin, COMMAND_GET_FILE);
      let url;

      if (isCommonCommandSupported) {
        url = URLS.pluginCommandCommon(projectKey, plugin.name, COMMAND_GET_FILE);
      } else {
        const integration = filterIntegrationsByName(globalIntegrations, plugin.name)[0];
        if (!integration) {
          return null;
        }
        url = URLS.projectIntegrationByIdCommand(projectKey, integration.id, COMMAND_GET_FILE);
      }

      return call(fetch, url, {
        method: 'PUT',
        data: { fileKey: 'main' },
      });
    })
    .filter(Boolean);
  if (calls.length === 0) {
    return;
  }
  yield put(extensionLoadStartAction());
  const results = yield all(calls);
  try {
    results.forEach((r) => {
      eval(r); // eslint-disable-line no-eval
    });
  } catch (err) {
    console.error('Plugin load error'); // eslint-disable-line no-console
  }
  yield put(extensionLoadFinishAction());
}
