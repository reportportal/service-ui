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

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Popover } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import filterFilledIcon from 'common/img/newIcons/filter-filled-inline.svg';
import { FilterContent } from './filterContent';
import styles from './filterButton.scss';

const cx = classNames.bind(styles);

export const FilterButton = ({
  definedFilters = {},
  onFilterChange,
  appliedFiltersCount,
  setAppliedFiltersCount,
  defaultFilters,
  filteredAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(defaultFilters);
  const [initialFilters, setInitialFilters] = useState(defaultFilters);

  useEffect(() => {
    dispatch(filteredAction());
  }, []);

  useEffect(() => {
    if (Object.keys(definedFilters).length) {
      let definedAppliedFiltersCount = 0;
      const updatedFilters = { ...filters };
      Object.keys(definedFilters).forEach((filterKey) => {
        updatedFilters[filterKey] = {
          ...updatedFilters[filterKey],
          condition: definedFilters[filterKey].condition,
          value: definedFilters[filterKey].value,
        };
        definedAppliedFiltersCount += definedFilters[filterKey].value ? 1 : 0;
      });
      setFilters(updatedFilters);
      setInitialFilters(updatedFilters);
      setAppliedFiltersCount(definedAppliedFiltersCount);
    } else {
      setFilters(defaultFilters);
      setInitialFilters(defaultFilters);
      setAppliedFiltersCount(0);
    }
  }, [definedFilters]);

  return (
    <Popover
      content={
        <FilterContent
          setIsOpen={setIsOpen}
          setAppliedFiltersCount={setAppliedFiltersCount}
          onFilterChange={onFilterChange}
          defaultFilters={defaultFilters}
          filters={filters}
          setFilters={setFilters}
          initialFilters={initialFilters}
          filteredAction={filteredAction}
        />
      }
      placement="bottom-end"
      className={cx('filter-popover')}
      isOpened={isOpen}
      setIsOpened={setIsOpen}
    >
      <div
        className={cx('filters-icon-container', {
          'with-applied': appliedFiltersCount,
          opened: isOpen,
        })}
        tabIndex={0}
      >
        <i className={cx('filter-icon')}>
          {appliedFiltersCount ? Parser(filterFilledIcon) : Parser(filterIcon)}
        </i>
        {appliedFiltersCount ? (
          <span className={cx('filters-count')}>{appliedFiltersCount}</span>
        ) : null}
      </div>
    </Popover>
  );
};

FilterButton.propTypes = {
  definedFilters: PropTypes.objectOf(
    PropTypes.shape({
      filter_key: PropTypes.string,
      value: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
  onFilterChange: PropTypes.func,
  appliedFiltersCount: PropTypes.number,
  setAppliedFiltersCount: PropTypes.func,
  defaultFilters: PropTypes.object,
  filteredAction: PropTypes.func.isRequired,
};
