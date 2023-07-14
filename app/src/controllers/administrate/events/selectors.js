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

import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { createReMappedQueryParametersSelector } from 'controllers/pages';
import { DEFAULT_SORTING } from './constants';
import { administrateDomainSelector } from '../selectors';

const domainSelector = (state) => administrateDomainSelector(state).events || {};

export const eventsPaginationSelector = (state) => domainSelector(state).pagination;
export const eventsSelector = (state) => domainSelector(state).events;
export const loadingSelector = (state) => domainSelector(state).loading || false;

export const querySelector = createReMappedQueryParametersSelector({
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: DEFAULT_SORTING,
});
