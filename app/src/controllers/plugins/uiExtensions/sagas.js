import { select, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { PUBLIC_PLUGINS } from 'controllers/plugins/constants';
import { METADATA_FILE_KEY, MAIN_FILE_KEY } from './constants';
import { pluginsSelector, publicPluginsSelector } from '../selectors';
import { fetchExtensionsMetadataSuccessAction } from './actions';

export function* fetchExtensionsMetadata(action) {
  const isPublicPluginNamespace = action && action.meta.namespace === PUBLIC_PLUGINS;
  const plugins = yield select(isPublicPluginNamespace ? publicPluginsSelector : pluginsSelector);
  const uiExtensionPlugins = plugins?.filter(
    (plugin) =>
      plugin.enabled &&
      plugin.details?.binaryData?.[METADATA_FILE_KEY] &&
      plugin.details.binaryData[MAIN_FILE_KEY],
  );

  if (!uiExtensionPlugins?.length) {
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
