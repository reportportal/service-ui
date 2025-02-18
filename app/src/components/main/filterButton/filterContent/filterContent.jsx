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
import { useTracking } from 'react-tracking';
import { Button } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useEffect } from 'react';
import { FilterInput } from './filterInput/filterInput';
import { messages } from './messages';
import styles from './filterContent.scss';

const cx = classNames.bind(styles);

export const FilterContentWrapped = ({
  setIsOpen,
  setAppliedFiltersCount,
  onFilterChange,
  defaultFilters,
  filteredAction,
  initialState,
  initialize,
  change,
  pristine,
  reset,
  submitting,
  handleSubmit,
  event,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const isDisabled = pristine || submitting;

  useEffect(() => {
    initialize(initialState);
  }, []);

  const closePopover = () => {
    setIsOpen(false);
  };

  const handleApply = (formData) => {
    let appliedFiltersCount = 0;

    const fields = Object.values(defaultFilters).reduce((acc, { filterName, defaultCondition }) => {
      const value = formData[filterName].toString();
      acc[filterName] = {
        value,
        condition: defaultCondition || formData[`${filterName}_condition`],
      };
      appliedFiltersCount += value ? 1 : 0;

      return acc;
    }, {});

    onFilterChange(fields);
    setAppliedFiltersCount(appliedFiltersCount);
    filteredAction();
    setIsOpen(false);

    if (event) {
      trackEvent(event(fields));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleApply)}>
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
  initialState: PropTypes.object.isRequired,
  filteredAction: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  event: PropTypes.func,
};

FilterContentWrapped.defaultProps = {
  event: null,
};

export const FilterContent = reduxForm({
  form: 'filter',
})(FilterContentWrapped);
