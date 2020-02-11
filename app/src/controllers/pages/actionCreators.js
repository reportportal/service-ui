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

import { UPDATE_PAGE_PROPERTIES, CLEAR_PAGE_STATE } from './constants';

export const updatePagePropertiesAction = (properties) => ({
  type: UPDATE_PAGE_PROPERTIES,
  payload: properties,
});

export const clearPageStateAction = (oldPage, newPage) => ({
  type: CLEAR_PAGE_STATE,
  payload: { oldPage, newPage },
});
