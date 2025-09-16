/*
 * Copyright 2025 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { Dropdown } from '@reportportal/ui-kit';
import { withFilter } from 'controllers/filter';
import { activeProjectSelector, idSelector } from 'controllers/user';
import {
  DateRangeFormField,
  formatDisplayedValue,
  parseFormattedDate,
  formatDateRangeToMinutesString,
} from 'components/main/dateRange';
import { timeRangeValues, getTimeRange } from './utils';
import { messages } from './messages';
import { FILTER_KEYS } from '../constants';
import { getStoredFilter, setStoredFilter } from '../utils';
import styles from './launchStartTimeFilter.scss';

const cx = classNames.bind(styles);

const DEFAULT_VALUE = timeRangeValues[3];

const LaunchStartTimeFilterComponent = ({ filter, onFilterChange }) => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(activeProjectSelector);
  const userId = useSelector(idSelector);
  const timeRange = getTimeRange(formatMessage);
  const [filterValue, setFilterValue] = useState(filter || DEFAULT_VALUE);

  useEffect(() => {
    if (userId && activeProject) {
      const stored = getStoredFilter(userId, activeProject, FILTER_KEYS.START_TIME);
      if (stored && !filter) {
        onFilterChange(stored);
        setFilterValue(stored);
      }
    }
  }, [filter, onFilterChange, userId, activeProject]);

  const handleFilterChange = (value) => {
    if (userId && activeProject) {
      setStoredFilter(userId, activeProject, FILTER_KEYS.START_TIME, value);
    }
    onFilterChange(value);
    setFilterValue(value);
  };

  const handleCustomDateChange = (closeDropdown) => (dateRange) => {
    if (dateRange?.startDate && dateRange?.endDate && dateRange?.startDate <= dateRange?.endDate) {
      const formattedValue = formatDateRangeToMinutesString(dateRange);
      handleFilterChange(formattedValue);
      closeDropdown();
    }
  };

  return (
    <div>
      <Dropdown
        toggleButtonClassName={cx('toggle-button')}
        selectListClassName={cx('select-list')}
        label={formatMessage(messages.label)}
        value={filterValue}
        onChange={handleFilterChange}
        options={timeRange}
        notScrollable
        formatDisplayedValue={(displayedValue) =>
          formatDisplayedValue(displayedValue, filter, timeRangeValues)
        }
        footer={(closeDropdown) => (
          <DateRangeFormField
            input={{
              value: parseFormattedDate(filterValue),
              onChange: handleCustomDateChange(closeDropdown),
            }}
          />
        )}
      />
    </div>
  );
};

LaunchStartTimeFilterComponent.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export const LaunchStartTimeFilter = withFilter({
  filterKey: FILTER_KEYS.START_TIME,
})(LaunchStartTimeFilterComponent);
