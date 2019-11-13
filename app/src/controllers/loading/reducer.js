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

import { FETCH_START, FETCH_SUCCESS, FETCH_ERROR, CONCAT_FETCH_SUCCESS } from 'controllers/fetch';

export const loadingReducer = (namespace) => (state = false, { type, meta }) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case FETCH_START:
      return true;
    case FETCH_SUCCESS:
      return false;
    case CONCAT_FETCH_SUCCESS:
      return false;
    case FETCH_ERROR:
      return false;
    default:
      return state;
  }
};
