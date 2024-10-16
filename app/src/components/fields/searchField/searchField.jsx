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
import Parser from 'html-react-parser';
import { FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import searchIcon from 'common/img/newIcons/search-outline-inline.svg';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { withFilter } from 'controllers/filter';
import styles from './searchField.scss';

const cx = classNames.bind(styles);

const SearchFieldWrapped = ({
  searchValue,
  setSearchValue,
  filter,
  onFilterChange,
  placeholder,
  isLoading,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onFilterChange(newValue);
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

  const handleBlur = () => {
    setIsSearchActive(false);
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
      startIcon={Parser(searchIcon)}
      className={cx('search-field')}
      maxLength={256}
      collapsible
      clearable
    />
  );
};

SearchFieldWrapped.propTypes = {
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  filter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
};

SearchFieldWrapped.defaultProps = {
  placeholder: '',
  isLoading: false,
};

export const SearchField = withFilter({ filterKey: SEARCH_KEY })(SearchFieldWrapped);
