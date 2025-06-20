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
import { USER } from 'common/constants/userObjectTypes';

export const FETCH_MEMBERS = 'fetchMembers';
export const NAMESPACE = 'members';
export const DEFAULT_SORTING = formatSortingString([USER], SORTING_ASC);
export const DEFAULT_SORT_COLUMN = 'fullName';
export const SEARCH_KEY = 'filter.cnt.fullName';
export const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100, 300];
