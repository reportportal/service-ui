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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ADD_EXPORT, REMOVE_EXPORT, RESET_EXPORTS } from './constants';

export const exportsReducer = (state = [], { type, payload }) => {
  switch (type) {
    case ADD_EXPORT:
      return state.concat(payload);
    case REMOVE_EXPORT:
      return state.filter((item) => item.id !== payload);
    case RESET_EXPORTS:
      return [];
    default:
      return state;
  }
};
