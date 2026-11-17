/*
 * Copyright 2025 EPAM Systems
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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Dropdown } from '@reportportal/ui-kit';
import styles from './dropdownWithIcon.scss';

const cx = classNames.bind(styles);

export const DropdownWithIcon = ({ options, selectedOption, placeholder, onChange }) => (
  <Dropdown
    icon={selectedOption.icon}
    className={cx('dropdown-with-icon')}
    options={options}
    placeholder={placeholder}
    value={selectedOption.value}
    renderOption={({ option, selected }) => (
      <div
        className={cx('option-wrapper', {
          'selected-option': selected,
        })}
      >
        <span className={cx('icon')}>{option.icon}</span>
        <div>
          <b>{option.label}</b>
          <div className={cx('description')}>{option.description}</div>
        </div>
      </div>
    )}
    onChange={onChange}
  />
);

const optionWithIconType = PropTypes.shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  description: PropTypes.node,
});

DropdownWithIcon.propTypes = {
  options: PropTypes.arrayOf(optionWithIconType).isRequired,
  selectedOption: optionWithIconType.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
