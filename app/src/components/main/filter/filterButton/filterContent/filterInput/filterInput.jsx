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
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './filterInput.scss';

const cx = classNames.bind(styles);

export const FilterInput = ({ filter, onChange }) => {
  const { filterName, title, helpText, fields } = filter;
  const withField = fields.length > 1;

  const onClear = (nameField) => onChange(nameField, '');

  return (
    <div className={cx('filter-item', { 'with-help-text': helpText })}>
      <span className={cx('label')}>{title}</span>
      <div className={cx('container')}>
        {fields.map(({ name, placeholder, options, value, condition }) => {
          if (options) {
            return (
              <FieldProvider key={name} name={name}>
                <Dropdown
                  options={options}
                  value={condition}
                  isListWidthLimited
                  className={cx({ dropdown: withField })}
                  placeholder={placeholder}
                />
              </FieldProvider>
            );
          }

          return (
            <div key={name} className={cx('input-field-container')}>
              <FieldProvider name={name}>
                <FieldText
                  name={filterName}
                  className={cx('input-field')}
                  placeholder={placeholder}
                  value={value}
                  onClear={() => onClear(name)}
                  clearable
                  helpText={helpText}
                  type="number"
                />
              </FieldProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
};

FilterInput.propTypes = {
  filter: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
