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
import { Button, Dropdown, FieldText, Popover } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import filterFilledIcon from 'common/img/newIcons/filter-filled-inline.svg';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  fetchFilteredProjectAction,
  LAST_RUN_DATE_FILTER_NAME,
  LAUNCHES_FILTER_NAME,
  PROJECT_NAME_FILTER_NAME,
  TEAMMATES_FILTER_NAME,
} from 'controllers/organization/projects';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { messages } from './messages';
import styles from './projectsFilterPopover.scss';

const cx = classNames.bind(styles);

export const FilterPopoverContent = ({
  setIsOpen,
  setAppliedFiltersCount,
  onFilterChange,
  definedFilters = {},
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const timeRange = [
    { label: formatMessage(messages.any), value: '' },
    { label: formatMessage(messages.today), value: 'today' },
    { label: formatMessage(messages.last2days), value: 'last2days' },
    { label: formatMessage(messages.last7days), value: 'last7days' },
    { label: formatMessage(messages.last30days), value: 'last30days' },
  ];
  const rangeComparisons = [
    { label: formatMessage(messages.equals), value: 'EQ' },
    { label: formatMessage(messages.greaterOrEqual), value: 'GTE' },
    { label: formatMessage(messages.lessOrEqual), value: 'LTE' },
  ];
  const containmentComparisons = [
    { label: formatMessage(messages.equals), value: 'EQ' },
    { label: formatMessage(messages.notEqual), value: 'NE' },
    { label: formatMessage(messages.contains), value: 'CNT' },
    { label: formatMessage(messages.notContains), value: 'NON_CNT' },
  ];
  const defaultFilters = {
    [LAST_RUN_DATE_FILTER_NAME]: {
      filterName: LAST_RUN_DATE_FILTER_NAME,
      options: timeRange,
      operation: 'BTW',
      value: timeRange[0].value,
    },
    [LAUNCHES_FILTER_NAME]: {
      filterName: LAUNCHES_FILTER_NAME,
      options: rangeComparisons,
      operation: rangeComparisons[0].value,
      value: '',
    },
    [TEAMMATES_FILTER_NAME]: {
      filterName: TEAMMATES_FILTER_NAME,
      options: rangeComparisons,
      operation: rangeComparisons[0].value,
      value: '',
    },
    [PROJECT_NAME_FILTER_NAME]: {
      filterName: PROJECT_NAME_FILTER_NAME,
      options: containmentComparisons,
      operation: containmentComparisons[0].value,
      value: '',
    },
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [initialFilters, setInitialFilters] = useState(defaultFilters);

  const closePopover = () => {
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  const handleApply = () => {
    let appliedFiltersCount = 0;
    const fields = Object.values(filters).reduce((acc, field) => {
      acc[field.filterName] = {
        value: field.value,
        condition: field.operation,
      };
      appliedFiltersCount += +!!field.value;
      return acc;
    }, {});
    onFilterChange(fields);
    setAppliedFiltersCount(appliedFiltersCount);
    setInitialFilters(filters);
    dispatch(fetchFilteredProjectAction());
    setIsOpen(false);
  };

  useEffect(() => {
    if (Object.keys(definedFilters).length) {
      let appliedFiltersCount = 0;
      const updatedFilters = { ...filters };
      Object.keys(definedFilters).forEach((filterKey) => {
        updatedFilters[filterKey] = {
          ...updatedFilters[filterKey],
          operation: definedFilters[filterKey].condition,
          value: definedFilters[filterKey].value,
        };
        appliedFiltersCount += +!!definedFilters[filterKey].value;
      });
      setFilters(updatedFilters);
      setInitialFilters(updatedFilters);
      setAppliedFiltersCount(appliedFiltersCount);
    } else {
      setFilters({ ...defaultFilters });
      setInitialFilters({ ...defaultFilters });
      setAppliedFiltersCount(0);
    }
  }, [definedFilters]);

  return (
    <div className={cx('filter-popover-content')}>
      <div className={cx('filter-items')}>
        {Object.values(filters).map((filter) => (
          <div className={cx('filter-item')} key={filter.filterName}>
            <span className={cx('label')}>{formatMessage(messages[filter.filterName])}</span>
            <div className={cx(filter.filterName, 'container')}>
              {filter.filterName === LAST_RUN_DATE_FILTER_NAME ? (
                <Dropdown
                  options={filter.options}
                  value={filter.value}
                  onChange={(val) => {
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      [filter.filterName]: { ...filter, value: val },
                    }));
                  }}
                  placeholder={'Any'}
                />
              ) : (
                <>
                  <Dropdown
                    options={filter.options}
                    value={filter.operation}
                    onChange={(operation) => {
                      setFilters((prevFilters) => ({
                        ...prevFilters,
                        [filter.filterName]: { ...filter, operation },
                      }));
                    }}
                    isListWidthLimited
                    className={cx('dropdown')}
                  />
                  <FieldText
                    className={cx('input-field')}
                    placeholder={formatMessage(messages[`${filter.filterName}Placeholder`])}
                    type={
                      [LAUNCHES_FILTER_NAME, TEAMMATES_FILTER_NAME].includes(filter.filterName)
                        ? 'number'
                        : 'text'
                    }
                    value={filter.value}
                    onChange={({ target }) => {
                      setFilters((prevFilters) => ({
                        ...prevFilters,
                        [filter.filterName]: { ...filter, value: target.value },
                      }));
                    }}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={cx('actions')}>
        <Button className={cx('clear-all')} variant={'text'} onClick={clearAllFilters}>
          {formatMessage(messages.clearAllFilters)}
        </Button>
        <div className={cx('controls')}>
          <Button className={cx('cancel')} variant={'ghost'} onClick={closePopover}>
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </Button>
          <Button
            className={cx('apply')}
            onClick={handleApply}
            disabled={isEqual(initialFilters, filters)}
          >
            {formatMessage(COMMON_LOCALE_KEYS.APPLY)}
          </Button>
        </div>
      </div>
    </div>
  );
};

FilterPopoverContent.propTypes = {
  definedFilters: PropTypes.objectOf(
    PropTypes.shape({
      filter_key: PropTypes.string,
      value: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
  setIsOpen: PropTypes.func,
  setAppliedFiltersCount: PropTypes.func,
  onFilterChange: PropTypes.func,
};

export const FilterPopover = ({
  entities,
  onChange,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setAppliedFiltersCount(Object.keys(entities).length);
    dispatch(fetchFilteredProjectAction());
  }, []);
  return (
    <Popover
      content={
        <FilterPopoverContent
          setIsOpen={setIsOpen}
          setAppliedFiltersCount={setAppliedFiltersCount}
          onFilterChange={onChange}
          definedFilters={entities}
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

FilterPopover.propTypes = {
  entities: PropTypes.objectOf(
    PropTypes.shape({
      filter_key: PropTypes.string,
      value: PropTypes.string,
      condition: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func,
  appliedFiltersCount: PropTypes.number,
  setAppliedFiltersCount: PropTypes.func,
};
