/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './input.scss';

const cx = classNames.bind(styles);

export const Input = ({
  type,
  value,
  readonly,
  className,
  error,
  placeholder,
  maxLength,
  disabled,
  mobileDisabled,
  refFunction,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyPress,
  touched,
}) => (
  <input
    ref={refFunction}
    type={type}
    className={cx('input', `type-${type}`, className, {
      'mobile-disabled': mobileDisabled,
      disabled,
      error,
      touched,
      readonly,
    })}
    value={value}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    readOnly={readonly}
    onChange={onChange}
    onFocus={onFocus}
    onBlur={onBlur}
    onKeyUp={onKeyUp}
    onKeyPress={onKeyPress}
  />
);

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  mobileDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyPress: PropTypes.func,
  refFunction: PropTypes.func,
  touched: PropTypes.bool,
};

Input.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  maxLength: '256',
  mobileDisabled: false,
  disabled: false,
  readonly: false,
  className: '',
  error: '',
  touched: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  onKeyPress: () => {},
  refFunction: () => {},
};
