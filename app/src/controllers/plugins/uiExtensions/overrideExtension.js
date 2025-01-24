/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { pluginByNameSelector } from 'controllers/plugins';
import { updateExtensionManifestAction, addExtensionManifestAction } from './actions';
import { MANIFEST_FILE_KEY } from './constants';

const fetchManifest = async (url, manifestFileName) => {
  const response = await fetch(`${url}/${manifestFileName}`, {
    contentType: 'application/json',
  });
  return response.json();
};

// TODO: restrict access to this function (f.e. only for admins)
export const createExtensionOverrider = (store) => async (pluginName, url) => {
  const plugin = pluginByNameSelector(store.getState(), pluginName);

  const manifestFileName =
    plugin.details?.binaryData?.[MANIFEST_FILE_KEY] || `${MANIFEST_FILE_KEY}.json`;

  const manifest = await fetchManifest(url, manifestFileName);

  store.dispatch(updateExtensionManifestAction({ ...manifest, pluginName, url }));

  return manifest;
};

// TODO: restrict access to this function (f.e. only for admins)
export const createExtensionAppender = (store) => async (url) => {
  const manifestFileName = `${MANIFEST_FILE_KEY}.json`;

  const manifest = await fetchManifest(url, manifestFileName);

  store.dispatch(addExtensionManifestAction({ ...manifest, url }));

  return manifest;
};
