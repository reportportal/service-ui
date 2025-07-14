/*
 * Copyright 2023 EPAM Systems
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
  ACTIVITIES,
  CONDITION_CNT,
  CONDITION_EQ,
  ENTITY_EVENTS_OBJECT_TYPE,
  ENTITY_SUBJECT_TYPE,
  reMappedOperationValuesMap,
} from 'components/filterEntities/constants';

export const getAppliedFilters = (filters, valueKey, filterKey, operation) => {
  const predefinedFilterKey = `predefinedFilter.${ACTIVITIES}`;

  const projectIdFilterParam = {
    filter_key: filterKey,
    value: valueKey,
    operation: operation || CONDITION_EQ,
  };

  const appliedFilters = Object.keys(filters).map((filter) => {
    if (filter === predefinedFilterKey) {
      const [filterName] = filter.split('.');

      return {
        filter_key: filterName,
        operation: CONDITION_CNT,
        value: filters[predefinedFilterKey],
      };
    }

    const [, operation, filterName] = filter.split('.');

    const value =
      filterName === ENTITY_SUBJECT_TYPE || filterName === ENTITY_EVENTS_OBJECT_TYPE
        ? filters[filter].toUpperCase()
        : filters[filter];

    return {
      filter_key: filterName,
      operation: reMappedOperationValuesMap[operation] || operation,
      value,
    };
  });

  return {
    search_criterias: [...appliedFilters, ...(valueKey ? [projectIdFilterParam] : [])],
  };
};
