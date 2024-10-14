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
import { queueReducers } from 'common/utils';
import { projectsReducer } from './projects/reducer';
import { usersReducer } from './users/reducer';
import { FETCH_ORGANIZATION_BY_SLUG, SET_ACTIVE_ORGANIZATION } from './constants';

const setActiveOrganizationReducer = (state = [], { type = '', payload = {} }) => {
  switch (type) {
    case SET_ACTIVE_ORGANIZATION:
      return payload;
    default:
      return state;
  }
};

export const organizationReducer = combineReducers({
  activeOrganization: queueReducers(
    fetchReducer(FETCH_ORGANIZATION_BY_SLUG, {
      contentPath: 'items',
      getFirst: true,
      initialState: null,
    }),
    setActiveOrganizationReducer,
  ),
  organizationLoading: loadingReducer(FETCH_ORGANIZATION_BY_SLUG),
  projects: projectsReducer,
  users: usersReducer,
});
