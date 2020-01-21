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

import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { ALL_USERS_PAGE } from 'controllers/pages';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { queueReducers } from 'common/utils/queueReducers';
import { createPageScopedReducer } from 'common/utils/createPageScopedReducer';
import { NAMESPACE, TOGGLE_USER_ROLE_FORM } from './constants';

const toggleUserRoleFormReducer = (state = [], { type, payload = {} }) => {
  switch (type) {
    case TOGGLE_USER_ROLE_FORM:
      return state.map((item) => {
        if (item.userId === payload.userId) {
          return { ...item, expandRoleSelection: payload.value };
        }
        return { ...item, expandRoleSelection: false };
      });
    default:
      return state;
  }
};

const reducer = combineReducers({
  allUsers: queueReducers(
    fetchReducer(NAMESPACE, { contentPath: 'content' }),
    toggleUserRoleFormReducer,
  ),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
});

export const allUsersReducer = createPageScopedReducer(reducer, ALL_USERS_PAGE);
