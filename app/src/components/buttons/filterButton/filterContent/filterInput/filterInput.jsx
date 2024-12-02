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
import { Dropdown, FieldText } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import styles from './filterInput.scss';

const cx = classNames.bind(styles);

export const FilterInput = ({ filter, setFilters }) => {
  const { filterName, options, value, condition, placeholder, title, withField } = filter;

  return (
    <div className={cx('filter-item')}>
      <span className={cx('label')}>{title}</span>
      <div className={cx('container')}>
        <Dropdown
          options={options}
          value={withField ? condition : value}
          onChange={(newValue) => {
            setFilters((prevFilters) => ({
              ...prevFilters,
              [filterName]: {
                ...filter,
                ...(withField ? { condition: newValue } : { value: newValue }),
              },
            }));
          }}
          isListWidthLimited
          className={cx({ dropdown: withField })}
          placeholder={placeholder}
        />
        {withField && (
          <FieldText
            className={cx('input-field')}
            placeholder={placeholder}
            value={value}
            onChange={({ target }) => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                [filterName]: { ...filter, value: target.value },
              }));
            }}
            onClear={() => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                [filterName]: { ...filter, value: '' },
              }));
            }}
            clearable
          />
        )}
      </div>
    </div>
  );
};

FilterInput.propTypes = {
  filter: PropTypes.object,
  setFilters: PropTypes.func,
};
