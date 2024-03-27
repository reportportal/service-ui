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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './fieldTextFlex.scss';

const cx = classNames.bind(styles);

const HEIGHT = 72;
const BORDER = 2;
const LIGHT_VARIANT = 'light';
const DARK_VARIANT = 'dark';

export const FieldTextFlex = ({
  value,
  readonly,
  error,
  placeholder,
  disabled,
  refFunction,
  onChange,
  onFocus,
  onBlur,
  onKeyUp,
  touched,
  className,
  label,
  helpText,
  variant,
}) => {
  const resizeHeight = (e) => {
    e.target.style.height = `${HEIGHT}px`;
    e.target.style.height = `${e.target.scrollHeight + BORDER}px`;
  };
  return (
    <>
      {label && <span className={cx('label', variant, { disabled })}>{label}</span>}
      <textarea
        ref={refFunction}
        className={cx('text-area', variant, className, {
          disabled,
          error,
          touched,
        })}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        onInput={resizeHeight}
      >
        {value}
      </textarea>
      {((error && touched) || helpText) && (
        <div className={cx('additional-content', variant, { disabled })}>
          {error && touched && <span className={cx('error-text', variant)}>{error}</span>}
          {helpText && <span className={cx('help-text', variant)}>{helpText}</span>}
        </div>
      )}
    </>
  );
};

FieldTextFlex.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  refFunction: PropTypes.func,
  className: PropTypes.string,
  label: PropTypes.string,
  helpText: PropTypes.string,
  variant: PropTypes.oneOf([LIGHT_VARIANT, DARK_VARIANT]),
};

FieldTextFlex.defaultProps = {
  value: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  error: '',
  touched: false,
  className: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  refFunction: () => {},
  label: '',
  helpText: '',
  variant: LIGHT_VARIANT,
};
