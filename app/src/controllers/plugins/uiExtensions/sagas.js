import { select, call, all, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { activeProjectSelector } from 'controllers/user';
import { COMMAND_GET_FILE } from './constants';
import { pluginsSelector, globalIntegrationsSelector } from '../selectors';
import { filterIntegrationsByName } from '../utils';
import { extensionLoadFinishAction, extensionLoadStartAction } from './actions';

export function* fetchUiExtensions() {
  const plugins = yield select(pluginsSelector);
  const uiExtensionPlugins = plugins.filter(
    (plugin) =>
      plugin.enabled &&
      plugin.details &&
      plugin.details.binaryData &&
      plugin.details.allowedCommands.includes(COMMAND_GET_FILE),
  );
  const globalIntegrations = yield select(globalIntegrationsSelector);
  const activeProject = yield select(activeProjectSelector);
  const calls = uiExtensionPlugins
    .map((plugin) => {
      const integration = filterIntegrationsByName(globalIntegrations, plugin.name)[0];
      if (!integration) {
        return null;
      }
      const fileKey = 'main';
      return call(
        fetch,
        URLS.projectIntegrationByIdCommand(activeProject, integration.id, COMMAND_GET_FILE),
        {
          method: 'PUT',
          data: { fileKey },
        },
      );
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
