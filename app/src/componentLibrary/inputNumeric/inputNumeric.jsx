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

import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import MinusIcon from './img/minus-inline.svg';
import PlusIcon from './img/plus-inline.svg';
import { DEFAULT_WIDTH_CH, KEYCODES_MAP, MAX_WIDTH_CH } from './constants';
import styles from './inputNumeric.scss';

const cx = classNames.bind(styles);

export const InputNumeric = ({
  value,
  placeholder,
  disabled,
  onChange,
  onFocus,
  onBlur,
  label,
  postfix,
  min,
  max,
  title,
  error,
  touched,
}) => {
  const inputRef = useRef();
  const handleChange = (event) => {
    const newValue = event.target.value.replace(/^0(?=\d+|^\d)/g, '');
    if (newValue === '') {
      onChange('');
      return;
    }
    if (newValue >= min && newValue <= max) {
      onChange(+newValue);
    }
  };
  const handleKeyDown = (event) => {
    const { keyCode } = event;

    if (Object.values(KEYCODES_MAP).includes(keyCode)) {
      return;
    }
    if (keyCode < 48 || keyCode > 57 || event.shiftKey) {
      event.preventDefault();
    }
  };
  const handleDecrease = () => {
    const newValue = +value - 1;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  const handleIncrease = () => {
    const newValue = +value + 1;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  const placeholderValue = placeholder + postfix;
  const inputWidth = useMemo(() => {
    let width = (String(value) || placeholderValue).length;
    if (postfix && !value) {
      width += 1;
    }

    return width > MAX_WIDTH_CH ? `${MAX_WIDTH_CH}ch` : `${width || DEFAULT_WIDTH_CH}ch`;
  }, [placeholderValue, postfix, value]);
  const handleInputFieldClick = () => {
    if (inputRef && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
    onFocus();
  };

  return (
    <div className={cx('container', { disabled })}>
      {label && <div className={cx('label')}>{label}</div>}
      <div
        className={cx('input-container', {
          filled: !!value || value === 0,
          error,
          disabled,
          touched,
        })}
        title={title}
      >
        <span className={cx('sign', { disabled })} onClick={disabled ? null : handleDecrease}>
          {Parser(MinusIcon)}
        </span>
        <span className={cx('input-field')} onClick={handleInputFieldClick}>
          <input
            ref={inputRef}
            className={cx('input')}
            type="number"
            value={value}
            placeholder={placeholderValue}
            disabled={disabled}
            min={min}
            max={max}
            onKeyDown={disabled ? null : handleKeyDown}
            onChange={disabled ? null : handleChange}
            onFocus={disabled ? null : onFocus}
            onBlur={disabled ? null : onBlur}
            style={{ width: inputWidth }}
          />
          {!!postfix && (value === 0 || !!value) && <span>{postfix.slice(0, 1)}</span>}
        </span>
        <span className={cx('sign', { disabled })} onClick={disabled ? null : handleIncrease}>
          {Parser(PlusIcon)}
        </span>
      </div>
    </div>
  );
};
InputNumeric.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  label: PropTypes.string,
  postfix: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  title: PropTypes.string,
  error: PropTypes.string,
  touched: PropTypes.bool,
};
InputNumeric.defaultProps = {
  value: '',
  placeholder: 0,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  label: '',
  postfix: '',
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  title: '',
  error: '',
  touched: false,
};
