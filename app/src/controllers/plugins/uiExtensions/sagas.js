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

import { select, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { PUBLIC_PLUGINS } from 'controllers/plugins/constants';
import { isPluginManifestAvailable } from './utils';
import { MANIFEST_FILE_KEY } from './constants';
import { pluginsSelector, publicPluginsSelector } from '../selectors';
import { fetchExtensionManifestsSuccessAction, updateExtensionManifestAction } from './actions';

const fetchPluginManifest = ({ details, name }) => {
  const manifestFileName = details.binaryData[MANIFEST_FILE_KEY];

  return fetch(URLS.pluginPublicFile(name, manifestFileName), {
    contentType: 'application/json',
  });
};

export function* fetchExtensionManifests(action) {
  const isPublicPluginNamespace = action?.meta?.namespace === PUBLIC_PLUGINS;
  const plugins = yield select(isPublicPluginNamespace ? publicPluginsSelector : pluginsSelector);
  const uiExtensionPlugins = plugins?.filter(isPluginManifestAvailable);

  if (!uiExtensionPlugins?.length) {
    return;
  }

  // TODO: discuss with BE whether all plugin manifests can be fetched via a single API call
  const calls = uiExtensionPlugins.map(fetchPluginManifest);

  if (calls.length === 0) {
    return;
  }

  try {
    const results = yield Promise.allSettled(calls);
    const manifestsArray = results.reduce((acc, result, index) => {
      if (result.status !== 'fulfilled') {
        return acc;
      }
      const { name: pluginName } = uiExtensionPlugins[index];
      return acc.concat({
        ...result.value,
        pluginName,
      });
    }, []);

    yield put(fetchExtensionManifestsSuccessAction(manifestsArray));
  } catch (error) {
    console.error('Plugin manifests load error'); // eslint-disable-line no-console
  }
}

export function* fetchExtensionManifest({ payload: plugin }) {
  const isManifestAvailable = isPluginManifestAvailable(plugin);

  if (!isManifestAvailable) {
    return;
  }
  const { name: pluginName } = plugin;

  try {
    const manifest = yield fetchPluginManifest(plugin);

    yield put(
      updateExtensionManifestAction({
        ...manifest,
        pluginName,
      }),
    );
  } catch (error) {
    console.error(`${pluginName} plugin  manifest load error`); // eslint-disable-line no-console
  }
}
