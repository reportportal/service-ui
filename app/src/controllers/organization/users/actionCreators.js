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

import {
  FETCH_ORGANIZATION_USERS,
  FETCH_USER_ASSIGNMENTS,
  PREPARE_ACTIVE_ORGANIZATION_USERS,
  UNASSIGN_FROM_ORGANIZATION,
  UPDATE_USER_ASSIGNMENTS,
} from './constants';

export const prepareActiveOrganizationUsersAction = (payload) => ({
  type: PREPARE_ACTIVE_ORGANIZATION_USERS,
  payload,
});

export const fetchOrganizationUsersAction = (params) => {
  return {
    type: FETCH_ORGANIZATION_USERS,
    payload: params,
  };
};

export const fetchUserAssignmentsAction = (organizationId, userId) => ({
  type: FETCH_USER_ASSIGNMENTS,
  payload: { organizationId, userId },
});

export const unassignFromOrganizationAction = (user, organization, onSuccess) => ({
  type: UNASSIGN_FROM_ORGANIZATION,
  payload: { user, organization, onSuccess },
});

export const updateUserAssignmentsAction = (organizationId, userId, payload, onSuccess, user = null) => ({
  type: UPDATE_USER_ASSIGNMENTS,
  payload: { organizationId, userId, payload, onSuccess, user },
});
