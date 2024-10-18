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

import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const FETCH_ORGANIZATION_PROJECTS = 'fetchOrganizationProjects';
export const NAMESPACE = 'organizationProjects';
export const CREATE_PROJECT = 'createProject';
export const DEFAULT_LIMITATION = 20;
export const DEFAULT_OFFSET = 0;
export const DEFAULT_SORT_COLUMN = 'name';
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_LIMITATION,
};

export const SORTING_KEY = 'order';

export const SEARCH_KEY = 'name';

export const DEFAULT_QUERY_PARAMS = {
  limit: DEFAULT_LIMITATION,
  offset: DEFAULT_OFFSET,
  order: SORTING_ASC,
  sort: DEFAULT_SORT_COLUMN,
};

export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_ASC);

export const initialPaginationState = {
  size: DEFAULT_LIMITATION,
  totalElements: 0,
  totalPages: 0,
};

export const ERROR_CODES = {
  PROJECT_EXISTS: 4095,
};
