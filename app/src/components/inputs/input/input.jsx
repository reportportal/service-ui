/*
 * Copyright 2019 EPAM Systems
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
  asyncValidating,
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
      asyncValidating,
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
  asyncValidating: PropTypes.bool,
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
  asyncValidating: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  onKeyPress: () => {},
  refFunction: () => {},
};
