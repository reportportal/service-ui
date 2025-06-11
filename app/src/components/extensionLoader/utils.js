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
import { MAIN_FILE_KEY } from 'controllers/plugins/uiExtensions/constants';

const DEFAULT_EXTENSION_FILE_NAME = 'remoteEntity.js';

export const getExtensionUrl = (extension) => {
  const { pluginName, url: remoteUrl, binaryData = {} } = extension;
  const fileName = binaryData[MAIN_FILE_KEY] || DEFAULT_EXTENSION_FILE_NAME;

  if (remoteUrl) {
    return `${remoteUrl}/${fileName}`;
  }

  return URLS.pluginPublicFile(pluginName, fileName);
};
