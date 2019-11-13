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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputTextArea.scss';

const cx = classNames.bind(styles);

export const InputTextArea = ({
  value,
  readonly,
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
  touched,
}) => (
  <textarea
    ref={refFunction}
    className={cx('input-text-area', {
      'mobile-disabled': mobileDisabled,
      disabled,
      error,
      touched,
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
  >
    {value}
  </textarea>
);

InputTextArea.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  readonly: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  refFunction: PropTypes.func,
};

InputTextArea.defaultProps = {
  value: '',
  placeholder: '',
  maxLength: '256',
  disabled: false,
  mobileDisabled: false,
  readonly: false,
  error: '',
  touched: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  refFunction: () => {},
};
