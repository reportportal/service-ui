/*
 * Copyright 2022 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './dropdownOption.scss';

const cx = classNames.bind(styles);

export const DropdownOption = ({
  label,
  disabled,
  hidden,
  selected,
  onChange,
  value,
  title,
  variant,
}) => {
  const onChangeHandler = () => onChange && onChange(value);

  return (
    <div
      className={cx(variant, 'dropdown-option', {
        selected,
        disabled,
        hidden,
      })}
      title={(disabled && title) || undefined}
      onClick={onChangeHandler}
    >
      <div className={cx('single-option')}>{label}</div>
    </div>
  );
};

DropdownOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
  label: PropTypes.node,
  disabled: PropTypes.bool,
  hidden: PropTypes.bool,
  selected: PropTypes.bool,
  onChange: PropTypes.func,
  title: PropTypes.string,
  variant: PropTypes.oneOf(['light', 'dark', 'ghost']),
};

DropdownOption.defaultProps = {
  value: '',
  label: '',
  disabled: false,
  hidden: false,
  selected: false,
  onChange: () => {},
  title: '',
};
