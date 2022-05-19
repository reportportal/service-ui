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
import Parser from 'html-react-parser';
import CrossIcon from './img/cross-inline.svg';
import styles from './fieldText.scss';

const cx = classNames.bind(styles);
const VARIANT = 'light';

export const FieldText = ({
  value,
  inputContainerClassName,
  error,
  placeholder,
  maxLength,
  disabled,
  refFunction,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  onKeyDown,
  touched,
  title,
  label,
  helperText,
  defaultWidth,
  startIcon,
  endIcon,
  withClearInputIcon = true,
}) => {
  const clearInput = () => onChange('');

  return (
    <>
      {label && <span className={cx(VARIANT, 'label', { disabled })}>{label}</span>}
      <div
        className={cx(VARIANT, 'input-container', inputContainerClassName, {
          error,
          touched,
          disabled,
          'default-width': defaultWidth,
        })}
        title={title}
      >
        {startIcon && (
          <span className={cx('icon-container-start')}>
            <i className={cx(VARIANT, 'icon')}>{Parser(startIcon)}</i>
          </span>
        )}
        <input
          ref={refFunction}
          type="text"
          className={cx(VARIANT, 'input')}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          onChange={disabled ? null : onChange}
          onFocus={disabled ? null : onFocus}
          onBlur={disabled ? null : onBlur}
          onKeyUp={disabled ? null : onKeyUp}
          onKeyDown={disabled ? null : onKeyDown}
        />
        {endIcon && (
          <span className={cx('icon-container-end')}>
            <i className={cx(VARIANT, 'icon')}>{Parser(endIcon)}</i>
          </span>
        )}
        {withClearInputIcon && (
          <span className={cx('icon-container-end')}>
            <i
              className={cx(VARIANT, 'clear-icon', { disabled })}
              onClick={disabled ? null : clearInput}
            >
              {Parser(CrossIcon)}
            </i>
          </span>
        )}
      </div>
      {(error || helperText) && (
        <div className={cx(VARIANT, 'additional-content', { disabled })}>
          {error && touched && <span className={cx(VARIANT, 'error-text')}>{error}</span>}
          {helperText && <span className={cx(VARIANT, 'helper-text')}>{helperText}</span>}
        </div>
      )}
    </>
  );
};
FieldText.propTypes = {
  value: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
  refFunction: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  touched: PropTypes.bool,
  title: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
  defaultWidth: PropTypes.bool,
  startIcon: PropTypes.string,
  endIcon: PropTypes.string,
  withClearInputIcon: PropTypes.bool,
};
FieldText.defaultProps = {
  value: '',
  inputContainerClassName: '',
  error: '',
  placeholder: 'placeholder',
  maxLength: 256,
  disabled: false,
  refFunction: () => {},
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  onKeyDown: () => {},
  touched: false,
  title: '',
  label: '',
  helperText: '',
  defaultWidth: true,
  startIcon: null,
  endIcon: null,
  withClearInputIcon: false,
};
