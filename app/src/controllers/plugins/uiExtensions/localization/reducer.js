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

import { omit } from 'common/utils/omit';
import { CHANGE_LANG_ACTION } from 'controllers/lang/constants';
import { UPDATE_EXTENSION_MANIFEST } from '../constants';
import { REGISTER_EXTENSION_MESSAGES } from './constants';

// State: flat map `pluginName -> messages` for the current app language.
export const extensionMessagesReducer = (state = {}, { type = '', payload = {} }) => {
  switch (type) {
    case REGISTER_EXTENSION_MESSAGES:
      return { ...state, [payload.pluginName]: payload.messages };
    // Manifest override changes the plugin source: drop its strings so the loader
    // re-fetches from the new URL.
    case UPDATE_EXTENSION_MANIFEST:
      return omit(state, [payload.pluginName]);
    // Strings belong to the previous language: drop all, loaders re-fetch under new lang.
    case CHANGE_LANG_ACTION:
      return {};
    default:
      return state;
  }
};
