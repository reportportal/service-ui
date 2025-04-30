/*
 * Copyright 2019 EPAM Systems
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

import { fetchReducer } from 'controllers/fetch';
import { queueReducers } from 'common/utils';
import { APP_INFO_NAMESPACE, UPDATE_SERVER_SETTINGS_SUCCESS } from './constants';

const serverSettingsReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case UPDATE_SERVER_SETTINGS_SUCCESS:
      return {
        ...state,
        api: {
          ...state.api,
          extensions: {
            ...state.api?.extensions,
            result: {
              ...state.api?.extensions?.result,
              [payload.key]: payload.value,
            },
          },
        },
      };
    default:
      return state;
  }
};

export const appInfoReducer = queueReducers(
  fetchReducer(APP_INFO_NAMESPACE, { initialState: {} }),
  serverSettingsReducer,
);
