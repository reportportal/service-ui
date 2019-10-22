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

import { formatSortingString, SORTING_DESC } from 'controllers/sorting';
import { ENTITY_CREATION_DATE } from 'components/filterEntities/constants';

export const FETCH_EVENTS = 'fetchEvents';
export const NAMESPACE = 'events';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_SORTING = formatSortingString([ENTITY_CREATION_DATE], SORTING_DESC);
