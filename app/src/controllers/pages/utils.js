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

import { isEmptyValue } from 'common/utils/isEmptyValue';
import {
  ACTIVITIES,
  CONDITION_CNT,
  CONDITION_EQ,
  ENTITY_EVENTS_OBJECT_TYPE,
  ENTITY_SUBJECT_TYPE,
  reMappedFilterEntityNamesMap,
  reMappedOperationValuesMap,
} from 'components/filterEntities/constants';
import { parseSortingString } from 'controllers/sorting/utils';

export const stringToArray = (str = '', separator) => {
  if (isEmptyValue(str)) {
    return [];
  }
  return str.toString().split(separator);
};

export const getAppliedFilters = (filters) => {
  const predefinedFilterKey = `predefinedFilter.${ACTIVITIES}`;
  return Object.keys(filters).map((filter) => {
    if (filter === predefinedFilterKey) {
      const [filterName] = filter.split('.');

      return {
        filter_key: filterName,
        operation: CONDITION_CNT,
        value: filters[predefinedFilterKey],
      };
    }

    const [, operation, filterName] = filter.split('.');
    const filterKeyValue = reMappedFilterEntityNamesMap[filterName] || filterName;
    const value =
      filterKeyValue === ENTITY_SUBJECT_TYPE || filterKeyValue === ENTITY_EVENTS_OBJECT_TYPE
        ? filters[filter].toUpperCase()
        : filters[filter];

    return {
      filter_key: filterKeyValue,
      operation: reMappedOperationValuesMap[operation] || operation,
      value,
    };
  });
};

export const getQueryParams = (sort, limit, pageNumber) => {
  const { direction: order, fields } = parseSortingString(sort);
  return {
    limit: Number(limit),
    sort: fields.join(','),
    offset: (pageNumber - 1) * limit,
    order,
  };
};

export const getSearchCriteria = (appliedFilters, projectId) => {
  const additionalSearchCriteriaParam = {
    filter_key: 'projectName',
    value: projectId,
    operation: CONDITION_EQ,
  };

  return {
    search_criterias: [...appliedFilters, additionalSearchCriteriaParam],
  };
};
