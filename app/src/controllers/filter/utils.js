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

export const updateFilter = (filters, filter, oldId) => {
  const id = oldId || filter.id;
  const filterIndex = filters.findIndex((item) => item.id === id);
  if (filterIndex === -1) {
    return [...filters, filter];
  }
  const newFilters = [...filters];
  newFilters.splice(filterIndex, 1, filter);
  return newFilters;
};

export const addFilteringFieldToConditions = (conditions = {}) =>
  Object.keys(conditions).map((key) => ({ ...conditions[key], filteringField: key }));

export const collectFilterEntities = (filters) =>
  Object.entries(filters).reduce((acc, [filterName, filterValue]) => {
    const [, condition, filteringField] = filterName.split('.');

    return Object.assign(acc, {
      [filteringField]: {
        value: filterValue,
        condition,
      },
    });
  }, {});
