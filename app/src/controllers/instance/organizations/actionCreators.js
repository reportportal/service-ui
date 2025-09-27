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
  FETCH_ORGANIZATIONS,
  FETCH_FILTERED_ORGANIZATIONS,
  DELETE_ORGANIZATION,
} from './constants';

export const fetchOrganizationsAction = () => ({
  type: FETCH_ORGANIZATIONS,
});

export const fetchFilteredOrganizationsAction = () => ({
  type: FETCH_FILTERED_ORGANIZATIONS,
});

export const deleteOrganizationAction = (organizationId, onSuccess) => ({
  type: DELETE_ORGANIZATION,
  payload: { organizationId, onSuccess },
});
