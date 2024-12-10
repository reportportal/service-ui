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
import { LAST_RUN_DATE_FILTER_NAME } from 'components/main/filterButton';

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

const getFormattedDate = (value) => {
  const utcString = moment().format('ZZ');
  const calculateStartDate = (days) =>
    moment()
      .startOf('day')
      .subtract(days - 1, 'days')
      .valueOf();
  const endOfToday = moment()
    .add(1, 'days')
    .startOf('day')
    .valueOf();
  let start = null;
  switch (value) {
    case 'today':
      start = calculateStartDate(1);
      break;
    case 'last2days':
      start = calculateStartDate(2);
      break;
    case 'last7days':
      start = calculateStartDate(7);
      break;
    case 'last30days':
      start = calculateStartDate(30);
      break;
    default:
      break;
  }
  return `${getMinutesFromTimestamp(start)};${getMinutesFromTimestamp(endOfToday)};${utcString}`;
};

export const updateFormatDate = (filtersParams) => {
  const { search_criteria: searchCriteria } = filtersParams;

  const lastRunDateFilterIndex = Object.values(searchCriteria).findIndex(
    (el) => el.filter_key === LAST_RUN_DATE_FILTER_NAME,
  );
  if (lastRunDateFilterIndex !== -1) {
    searchCriteria[lastRunDateFilterIndex].value = getFormattedDate(
      searchCriteria[lastRunDateFilterIndex].value,
    );
  }
};
