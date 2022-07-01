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
  className,
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
  helpText,
  defaultWidth,
  startIcon,
  endIcon,
  clearable,
  isRequired,
}) => {
  const clearInput = () => onChange('');

  return (
    <>
      {label && <span className={cx(VARIANT, 'label', { disabled })}>{label}</span>}
      <div
        className={cx(VARIANT, 'input-container', className, {
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
        <span className={cx(VARIANT, 'custom-input-wrapper')}>
          <input
            ref={refFunction}
            type="text"
            className={cx(VARIANT, 'input')}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
            onChange={disabled ? null : onChange}
            onFocus={disabled ? null : onFocus}
            onBlur={disabled ? null : onBlur}
            onKeyUp={disabled ? null : onKeyUp}
            onKeyDown={disabled ? null : onKeyDown}
          />
          {placeholder && !value && (
            <span className={cx(VARIANT, 'placeholder')}>
              {placeholder}
              {isRequired && <span className={cx(VARIANT, 'asterisk')} />}
            </span>
          )}
        </span>
        {endIcon && (
          <span className={cx('icon-container-end')}>
            <i className={cx(VARIANT, 'icon')}>{Parser(endIcon)}</i>
          </span>
        )}
        {clearable && (
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
      {((error && touched) || helpText) && (
        <div className={cx(VARIANT, 'additional-content', { disabled })}>
          {error && touched && <span className={cx(VARIANT, 'error-text')}>{error}</span>}
          {helpText && <span className={cx(VARIANT, 'help-text')}>{helpText}</span>}
        </div>
      )}
    </>
  );
};
FieldText.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
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
  helpText: PropTypes.string,
  defaultWidth: PropTypes.bool,
  startIcon: PropTypes.string,
  endIcon: PropTypes.string,
  clearable: PropTypes.bool,
  isRequired: PropTypes.bool,
};
FieldText.defaultProps = {
  value: '',
  className: '',
  error: '',
  placeholder: '',
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
  helpText: '',
  defaultWidth: true,
  startIcon: null,
  endIcon: null,
  clearable: false,
  isRequired: false,
};
