import { select, call, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { activeProjectSelector } from 'controllers/user';
import { PUBLIC_PLUGINS } from 'controllers/plugins/constants';
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
      plugin.details?.binaryData?.[METADATA_FILE_KEY] &&
      plugin.details.binaryData[MAIN_FILE_KEY],
  );

  if (!uiExtensionPlugins.length) {
    return;
  }

  // TODO: discuss with BE whether we can fetch plugins metadata via single API call
  const calls = uiExtensionPlugins.map((plugin) => {
    const metadataFile = plugin.details.binaryData[METADATA_FILE_KEY];
    return fetch(URLS.pluginPublicFile(plugin.name, metadataFile), {
      contentType: 'application/json',
    });
  });

  if (calls.length === 0) {
    return;
  }

  try {
    const results = yield Promise.allSettled(calls);
    const metadataArray = results.reduce((acc, result, index) => {
      if (result.status !== 'fulfilled') {
        return acc;
      }
      return acc.concat({
        ...result.value,
        pluginName: uiExtensionPlugins[index].name,
      });
    }, []);

    yield put(fetchExtensionsMetadataSuccessAction(metadataArray));
  } catch (error) {
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
      plugin.details?.binaryData?.[MAIN_FILE_KEY] &&
      (isPluginSupportsCommonCommand(plugin, COMMAND_GET_FILE) ||
        plugin.details.allowedCommands.includes(COMMAND_GET_FILE)),
  );
  const activeProject = yield select(activeProjectSelector);
  const calls = uiExtensionPlugins
    .map((plugin) => {
      const isCommonCommandSupported = isPluginSupportsCommonCommand(plugin, COMMAND_GET_FILE);
      let url;

      if (isCommonCommandSupported) {
        url = URLS.pluginCommandCommon(activeProject, plugin.name, COMMAND_GET_FILE);
      } else {
        const integration = filterIntegrationsByName(globalIntegrations, plugin.name)[0];
        if (!integration) {
          return null;
        }
        url = URLS.projectIntegrationByIdCommand(activeProject, integration.id, COMMAND_GET_FILE);
      }

      return fetch(url, {
        method: 'PUT',
        data: { fileKey: 'main' },
      });
    })
    .filter(Boolean);
  if (calls.length === 0) {
    return;
  }
  yield put(extensionLoadStartAction());

  try {
    const results = yield Promise.allSettled(calls);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        try {
          eval(result.value); // eslint-disable-line no-eval
        } catch {
          console.error('Failed to execute the code'); // eslint-disable-line no-console
        }
      } else {
        console.error(result.reason); // eslint-disable-line no-console
      }
    });
  } catch (error) {
    console.error('Plugin load error'); // eslint-disable-line no-console
  }

  yield put(extensionLoadFinishAction());
}
