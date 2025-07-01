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

import moment from 'moment/moment';
import { getMinutesFromTimestamp } from 'common/utils';
import { getAppliedFilters } from 'controllers/instance/events/utils';

export function bindDefaultValue(key, options = {}) {
  const { filterValues } = this.props;
  if (key in filterValues) {
    return filterValues[key];
  }
  return {
    filteringField: key,
    value: '',
    ...options,
  };
}

export const getFormattedDate = (formValue) => {
  if (typeof formValue === 'string') {
    return formValue;
  }

  const { startDate, endDate } = formValue || {};

  const utcString = moment().format('ZZ');

  return `${getMinutesFromTimestamp(startDate)};${getMinutesFromTimestamp(endDate)};${utcString}`;
};

export const prepareQueryFilters = (filtersParams, dateProp) => {
  const { limit, sort, offset, order, ...rest } = filtersParams;

  const searchCriteria = getAppliedFilters(rest)?.search_criterias;

  if (dateProp) {
    const dateFilterIndex = Object.values(searchCriteria).findIndex(
      (el) => el.filter_key === dateProp,
    );

    if (dateFilterIndex !== -1) {
      searchCriteria[dateFilterIndex].value = getFormattedDate(
        searchCriteria[dateFilterIndex].value,
      );
    }
  }

  return {
    limit,
    sort,
    offset,
    order,
    search_criteria: searchCriteria,
  };
};
