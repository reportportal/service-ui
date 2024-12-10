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

export const FilterInput = ({ filter, onFilter }) => {
  const { filterName, options, value, condition, placeholder, title, withField, helpText } = filter;

  const onChangeOption = (newValue) => {
    onFilter({
      [filterName]: {
        ...filter,
        ...(withField ? { condition: newValue } : { value: newValue }),
      },
    });
  };

  const onTextFieldChange = ({ target }) => {
    if (helpText && !Number(target.value)) {
      return;
    }

    onFilter({ [filterName]: { ...filter, value: target.value } });
  };

  const onClear = () => onFilter({ [filterName]: { ...filter, value: '' } });

  return (
    <div className={cx('filter-item', { 'with-help-text': helpText })}>
      <span className={cx('label')}>{title}</span>
      <div className={cx('container')}>
        <Dropdown
          options={options}
          value={withField ? condition : value}
          onChange={onChangeOption}
          isListWidthLimited
          className={cx({ dropdown: withField })}
          placeholder={placeholder}
        />
        {withField && (
          <div className={cx('input-field-container')}>
            <FieldText
              className={cx('input-field')}
              placeholder={placeholder}
              value={value}
              onChange={onTextFieldChange}
              onClear={onClear}
              clearable
              helpText={helpText}
            />
          </div>
        )}
      </div>
    </div>
  );
};

FilterInput.propTypes = {
  filter: PropTypes.object,
  onFilter: PropTypes.func,
};
