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

import { createSelector } from 'reselect';
import { langSelector } from 'controllers/lang';
import { CORE_MESSAGES } from 'common/constants/coreMessages';
import { domainSelector } from '../../selectors';

const extensionMessagesSelector = (state) =>
  domainSelector(state).uiExtensions?.extensionMessages || {};

// Flatten all extensions' messages into a single id -> string map (deterministic order).
const flattenedExtensionMessagesSelector = createSelector(
  extensionMessagesSelector,
  (messagesByPlugin) =>
    Object.keys(messagesByPlugin)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, pluginName) => ({ ...acc, ...messagesByPlugin[pluginName] }), {}),
);

// Final catalog for IntlProvider: core first, then extension messages on top.
export const mergedMessagesSelector = createSelector(
  langSelector,
  flattenedExtensionMessagesSelector,
  (lang, extensionMessages) => ({ ...CORE_MESSAGES[lang], ...extensionMessages }),
);
