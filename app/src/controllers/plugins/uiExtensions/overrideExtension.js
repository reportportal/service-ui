import { pluginByNameSelector } from 'controllers/plugins';
import { updateExtensionManifestAction } from './actions';
import { MANIFEST_FILE_KEY } from './constants';

// TODO: restrict access to this function (f.e. only for admins)
export const createExtensionOverrider = (store) => async (pluginName, url) => {
  const plugin = pluginByNameSelector(store);

  const manifestFileName =
    plugin.details?.binaryData?.[MANIFEST_FILE_KEY] || `${MANIFEST_FILE_KEY}.json`;

  const response = await fetch(`${url}/${manifestFileName}`, {
    contentType: 'application/json',
  });
  const manifest = await response.json();

  store.dispatch(updateExtensionManifestAction({ ...manifest, pluginName, url }));

  return manifest;
};
