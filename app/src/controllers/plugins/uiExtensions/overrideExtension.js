import { updateExtensionMetadataAction } from './actions';
import { METADATA_FILE_KEY } from './constants';

// TODO: restrict access to this function (f.e. only for admins)
export const createExtensionOverrider = (store) => async (pluginName, url) => {
  const response = await fetch(`${url}/${METADATA_FILE_KEY}.json`, {
    contentType: 'application/json',
  });
  const metadata = await response.json();

  store.dispatch(updateExtensionMetadataAction({ ...metadata, pluginName, url }));

  return metadata;
};
