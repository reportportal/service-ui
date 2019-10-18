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

import { SORTING_ASC, SORTING_DESC } from './constants';

const isDirection = (value) => value === SORTING_ASC || value === SORTING_DESC;

export const parseSortingString = (sortingString = '') => {
  const fields = sortingString.length > 0 ? sortingString.split(',') : [];
  const direction = isDirection(fields[fields.length - 1]) ? fields.pop() : null;
  return {
    fields,
    direction,
  };
};

export const formatSortingString = (fields = [], direction) => {
  const items = direction ? [...fields, direction] : fields;
  return items.join(',');
};
