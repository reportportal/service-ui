/*!
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
import PropTypes from 'prop-types';
import { useTracking } from 'react-tracking';
import { FieldText, SearchIcon } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import styles from './searchField.scss';

const cx = classNames.bind(styles);

export function SearchField({
  searchValue,
  setSearchValue,
  filter,
  onFilterChange,
  placeholder,
  isLoading,
  event,
  className,
}) {
  const { trackEvent } = useTracking();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onFilterChange(newValue);

    if (!isTouched && event) {
      trackEvent(event);
      setIsTouched(true);
    }
  };

  const handleSearchClear = () => {
    setSearchValue('');
    onFilterChange('');
  };

  useEffect(() => {
    if (searchValue === null && filter) {
      setSearchValue(filter);
    }
  }, []);

  const handleBlur = (e) => {
    setIsSearchActive(false);

    if (e.target.value === '') {
      setIsTouched(false);
    }
  };

  const handleFocus = () => {
    setIsSearchActive(true);
  };

  return (
    <FieldText
      value={searchValue ?? filter ?? ''}
      onChange={handleSearchChange}
      onClear={handleSearchClear}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      loading={isSearchActive && isLoading}
      startIcon={<SearchIcon />}
      className={cx('search-field', className)}
      maxLength={256}
      collapsible
      clearable
    />
  );
}

SearchField.propTypes = {
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  filter: PropTypes.string,
  className: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  event: PropTypes.object,
};

SearchField.defaultProps = {
  placeholder: '',
  isLoading: false,
  event: null,
};
