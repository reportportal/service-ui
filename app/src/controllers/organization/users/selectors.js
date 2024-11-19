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

import { SORTING_ASC } from 'controllers/sorting';
import { createAlternativeQueryParametersSelector } from 'controllers/pages/selectors';
import { organizationSelector } from '../selectors';
import { NAMESPACE } from './constants';
import { DEFAULT_PAGINATION, SORTING_KEY } from '../projects/constants';

const domainSelector = (state) => organizationSelector(state).users || {};

export const usersPaginationSelector = (state) => domainSelector(state).pagination;
export const usersSelector = (state) => domainSelector(state).users;
export const loadingSelector = (state) => domainSelector(state).loading || false;

export const querySelector = createAlternativeQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
});
