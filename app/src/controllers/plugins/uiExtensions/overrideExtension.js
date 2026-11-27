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

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// window.RP is the documented developer workflow for testing plugin builds (docs/9-localization.md).
// A client-side role check would not be a security boundary (any script on the page can inject a
// <script> itself), so the functions stay available but only accept http(s) URLs and say what they do.
const validateExtensionUrl = (url) => {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Extension URL must be an absolute http(s) URL: ${url}`);
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(`Extension URL must be an absolute http(s) URL: ${url}`);
  }
};

const warnAboutOverride = (message) => {
  console.warn(`[ReportPortal developer tool] ${message}`);
};

const fetchManifest = async (url, manifestFileName) => {
  const response = await fetch(`${url}/${manifestFileName}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load extension manifest ${manifestFileName}: ${response.status}`);
  }
  return response.json();
};

export const createExtensionOverrider = (store) => async (pluginName, url) => {
  validateExtensionUrl(url);
  warnAboutOverride(
    `Plugin "${pluginName}" UI is overridden with code from ${new URL(url).origin}.`,
  );

  const plugin = pluginByNameSelector(store.getState(), pluginName);

  const manifestFileName =
    plugin.details?.binaryData?.[MANIFEST_FILE_KEY] || `${MANIFEST_FILE_KEY}.json`;

  const manifest = await fetchManifest(url, manifestFileName);

  store.dispatch(updateExtensionManifestAction({ ...manifest, pluginName, url }));

  return manifest;
};

export const createExtensionAppender = (store) => async (url) => {
  validateExtensionUrl(url);
  warnAboutOverride(`A UI extension is appended with code from ${new URL(url).origin}.`);

  const manifestFileName = `${MANIFEST_FILE_KEY}.json`;

  const manifest = await fetchManifest(url, manifestFileName);

  store.dispatch(addExtensionManifestAction({ ...manifest, url }));

  return manifest;
};
