/*
 * Copyright 2026 EPAM Systems
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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';

export const resolveLocaleFileName = (template, lang) => template.replace('{lang}', lang);

/**
 * Loads an extension's localization file from the same base URL as its MF entry.
 * - installed plugin (no baseUrl): host API `plugin/public/{pluginName}/file/{fileKey}`;
 * - overridden plugin (baseUrl set): the plugin's own origin (dev server / CDN).
 */
export const fetchExtensionLocalizationFile = ({ pluginName, baseUrl, fileName }) => {
  if (baseUrl) {
    return window.fetch(new URL(`/${fileName}`, baseUrl)).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load extension localization file (${response.status})`);
      }
      return response.json();
    });
  }

  return fetch(URLS.pluginPublicFile(pluginName, fileName), { contentType: 'application/json' });
};
