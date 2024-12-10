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

import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useMemo } from 'react';
import { FilterInput } from './filterInput';
import { messages } from './messages';
import styles from './filterContent.scss';

const cx = classNames.bind(styles);

export const FilterContent = ({
  setIsOpen,
  setAppliedFiltersCount,
  onFilterChange,
  defaultFilters,
  filters,
  setFilters,
  initialFilters,
  filteredAction,
}) => {
  const { formatMessage } = useIntl();

  const closePopover = () => {
    setIsOpen(false);
    setFilters(initialFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    let appliedFiltersCount = 0;

    const fields = Object.values(filters).reduce((acc, { filterName, value, condition }) => {
      acc[filterName] = {
        value,
        condition,
      };
      appliedFiltersCount += value ? 1 : 0;

      return acc;
    }, {});
    onFilterChange(fields);
    setAppliedFiltersCount(appliedFiltersCount);
    filteredAction();
    setIsOpen(false);
  };

  const isDefaultFilters = useMemo(() => isEqual(defaultFilters, filters), [
    defaultFilters,
    filters,
  ]);
  const isDefinedFilters = useMemo(() => isEqual(initialFilters, filters), [
    initialFilters,
    filters,
  ]);

  const handleChangeFilters = (newFilters) =>
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));

  return (
    <div className={cx('filter-popover-content')}>
      <div className={cx('filter-items')}>
        {Object.values(filters).map((filter) => (
          <FilterInput key={filter.filterName} filter={filter} onFilter={handleChangeFilters} />
        ))}
      </div>
      <div className={cx('actions')}>
        <Button
          className={cx('clear-all')}
          variant={'text'}
          onClick={clearAllFilters}
          disabled={isDefaultFilters}
        >
          {formatMessage(messages.clearAllFilters)}
        </Button>
        <div className={cx('controls')}>
          <Button className={cx('cancel')} variant={'ghost'} onClick={closePopover}>
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button className={cx('apply')} onClick={handleApply} disabled={isDefinedFilters}>
            {formatMessage(COMMON_LOCALE_KEYS.APPLY)}
          </Button>
        </div>
      </div>
    </div>
  );
};

FilterContent.propTypes = {
  setIsOpen: PropTypes.func.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  defaultFilters: PropTypes.object.isRequired,
  initialFilters: PropTypes.array.isRequired,
  filters: PropTypes.array.isRequired,
  setFilters: PropTypes.func.isRequired,
  filteredAction: PropTypes.func.isRequired,
};
