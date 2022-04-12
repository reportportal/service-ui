import { URLS } from 'common/urls';

const DEFAULT_EXTENSION_FILE_NAME = 'remoteEntity.js';

export const getExtensionUrl = (extension) => {
  const isDev = process.env.NODE_ENV === 'development';
  const { pluginName, isPublic, url: defaultUrl } = extension;

  if (isDev && defaultUrl) {
    return `${defaultUrl}/${DEFAULT_EXTENSION_FILE_NAME}`;
  }

  return isPublic
    ? URLS.pluginPublicFile(pluginName, DEFAULT_EXTENSION_FILE_NAME)
    : URLS.pluginFile(pluginName, DEFAULT_EXTENSION_FILE_NAME);
};
