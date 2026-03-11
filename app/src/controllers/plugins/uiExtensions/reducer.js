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

import { combineReducers } from 'redux';
import {
  FETCH_EXTENSION_MANIFESTS_SUCCESS,
  UPDATE_EXTENSION_MANIFEST,
  ADD_EXTENSION_MANIFEST,
} from './constants';

const extensionManifestsReducer = (state = [], { type = '', payload = {} }) => {
  switch (type) {
    case FETCH_EXTENSION_MANIFESTS_SUCCESS:
      return payload;
    case UPDATE_EXTENSION_MANIFEST: {
      const index = state.findIndex((item) => item.pluginName === payload.pluginName);
      if (index === -1) {
        return state.concat(payload);
      }
      return state.map((item, i) => (i === index ? payload : item));
    }
    case ADD_EXTENSION_MANIFEST:
      return [...state, payload];
    default:
      return state;
  }
};

export const uiExtensionsReducer = combineReducers({
  extensionManifests: extensionManifestsReducer,
});
