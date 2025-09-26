/*!
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

import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';

export const NAMESPACE = 'organizations';

// TODO: After joining the filter and the search, leave one constant
export const FETCH_ORGANIZATIONS = 'fetchOrganizations';
export const FETCH_FILTERED_ORGANIZATIONS = 'fetchFilteredOrganizations';
export const DELETE_ORGANIZATION = 'deleteOrganization';
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_LIMITATION = 20;
export const initialPaginationState = {
  size: DEFAULT_LIMITATION,
  totalElements: 0,
  totalPages: 0,
};
export const SORTING_KEY = 'order';
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_LIMITATION,
};

export enum SortingFields {
  CREATED_AT = 'created_at',
  NAME = 'name',
  USERS = 'users',
  PROJECTS = 'projects',
  LAST_LAUNCH_DATE = 'last_launch_occurred',
}

export const ORGANIZATIONS_DEFAULT_SORT_COLUMN = SortingFields.NAME;

export const ERROR_CODES = {
  NOT_FOUND: 40429,
};
