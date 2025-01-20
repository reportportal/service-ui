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
import { reduxForm } from 'redux-form';
import { Button } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { FilterInput } from './filterInput';
import {
  LAST_RUN_DATE_FILTER_NAME,
  LAUNCHES_FILTER_NAME,
  LAUNCHES_FILTER_NAME_CONDITION,
  TEAMMATES_FILTER_NAME,
  TEAMMATES_FILTER_NAME_CONDITION,
} from '../constants';
import { messages } from './messages';
import styles from './filterContent.scss';

const cx = classNames.bind(styles);

export const FilterContentWrapped = ({
  setIsOpen,
  setAppliedFiltersCount,
  onFilterChange,
  defaultFilters,
  definedFilters,
  filteredAction,
  initialize,
  change,
  pristine,
  reset,
  submitting,
  filtersState,
}) => {
  const { formatMessage } = useIntl();
  const isDisabled = pristine || submitting;

  useEffect(() => {
    initialize({
      [LAST_RUN_DATE_FILTER_NAME]:
        definedFilters[LAST_RUN_DATE_FILTER_NAME]?.value ||
        defaultFilters[LAST_RUN_DATE_FILTER_NAME].fields[0].value,
      [LAUNCHES_FILTER_NAME]:
        definedFilters[LAUNCHES_FILTER_NAME]?.value ||
        defaultFilters[LAUNCHES_FILTER_NAME].fields[1].value,
      [LAUNCHES_FILTER_NAME_CONDITION]:
        definedFilters[LAUNCHES_FILTER_NAME]?.condition ||
        defaultFilters[LAUNCHES_FILTER_NAME].fields[0].condition,
      [TEAMMATES_FILTER_NAME]:
        definedFilters[TEAMMATES_FILTER_NAME]?.value ||
        defaultFilters[TEAMMATES_FILTER_NAME].fields[1].value,
      [TEAMMATES_FILTER_NAME_CONDITION]:
        definedFilters[TEAMMATES_FILTER_NAME]?.condition ||
        defaultFilters[TEAMMATES_FILTER_NAME].fields[0].condition,
    });
  }, []);

  const closePopover = () => {
    setIsOpen(false);
  };

  const handleApply = () => {
    let appliedFiltersCount = 0;

    const fields = Object.values(defaultFilters).reduce((acc, { filterName, defaultCondition }) => {
      const value = filtersState[filterName];
      acc[filterName] = {
        value,
        condition: defaultCondition || filtersState[`${filterName}_condition`],
      };
      appliedFiltersCount += value ? 1 : 0;

      return acc;
    }, {});

    onFilterChange(fields);
    setAppliedFiltersCount(appliedFiltersCount);
    filteredAction();
    setIsOpen(false);
  };

  return (
    <form onSubmit={handleApply}>
      <div className={cx('filter-popover-content')}>
        <div className={cx('filter-items')}>
          {Object.values(defaultFilters).map((filter) => (
            <FilterInput key={filter.filterName} filter={filter} onChange={change} />
          ))}
        </div>
        <div className={cx('actions')}>
          <Button
            className={cx('clear-all')}
            variant={'text'}
            onClick={reset}
            disabled={isDisabled}
          >
            {formatMessage(messages.clearAllFilters)}
          </Button>
          <div className={cx('controls')}>
            <Button className={cx('cancel')} variant={'ghost'} onClick={closePopover}>
              {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
            </Button>
            <Button className={cx('apply')} type="submit" disabled={isDisabled}>
              {formatMessage(COMMON_LOCALE_KEYS.APPLY)}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

FilterContentWrapped.propTypes = {
  setIsOpen: PropTypes.func.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  defaultFilters: PropTypes.object.isRequired,
  definedFilters: PropTypes.object.isRequired,
  filteredAction: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
  filtersState: PropTypes.object.isRequired,
};

export const FilterContentForm = reduxForm({
  form: 'filter',
})(FilterContentWrapped);

export const FilterContent = connect((state) => ({
  filtersState: state?.form?.filter?.values || {},
}))(FilterContentForm);
