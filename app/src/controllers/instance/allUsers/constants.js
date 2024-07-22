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

import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const FETCH_ALL_USERS = 'fetchAllUsers';
export const NAMESPACE = 'allUsers';
export const TOGGLE_USER_ROLE_FORM = 'toggleUserRoleFormAction';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_SORT_COLUMN = 'fullName';
export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_ASC);
