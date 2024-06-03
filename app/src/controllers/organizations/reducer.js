/*
 * Copyright 2024 EPAM Systems
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

import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { ACTIVE_ORGANIZATION_NAMESPACE, NAMESPACE, PROJECTS_NAMESPACE } from './constants';

export const organizationsReducer = combineReducers({
  list: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  listLoading: loadingReducer(NAMESPACE),
  projects: fetchReducer(PROJECTS_NAMESPACE, { contentPath: 'content' }),
  activeOrganization: fetchReducer(ACTIVE_ORGANIZATION_NAMESPACE),
});
