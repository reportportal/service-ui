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

import { URLS } from 'common/urls';

const DEFAULT_EXTENSION_FILE_NAME = 'remoteEntity.js';
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// Returns the extension entry URL, or null when the manifest URLs are not valid http(s) URLs.
export const getExtensionUrl = (extension) => {
  const { pluginName, url: baseUrl, payload: { url } = {} } = extension;
  const fileName = DEFAULT_EXTENSION_FILE_NAME;

  if (!baseUrl) {
    return URLS.pluginPublicFile(pluginName, fileName);
  }

  try {
    const base = new URL(baseUrl, window.location.origin);
    const resolved = new URL(url || `/${fileName}`, base);

    if (
      !ALLOWED_PROTOCOLS.includes(base.protocol) ||
      !ALLOWED_PROTOCOLS.includes(resolved.protocol)
    ) {
      return null;
    }

    return resolved.href;
  } catch {
    return null;
  }
};

export const isSameOriginUrl = (url) => {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
};
