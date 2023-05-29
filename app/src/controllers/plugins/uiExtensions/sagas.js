import { select, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { activeProjectSelector } from 'controllers/user';
import { COMMAND_GET_FILE } from './constants';
import { pluginsSelector, globalIntegrationsSelector } from '../selectors';
import { filterIntegrationsByName, isPluginSupportsCommonCommand } from '../utils';
import { extensionLoadFinishAction, extensionLoadStartAction } from './actions';

export function* fetchUiExtensions() {
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
