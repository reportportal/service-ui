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
import styles from './inputRadio.scss';

const cx = classNames.bind(styles);

export function InputRadio({
  children,
  value,
  ownValue,
  name,
  disabled,
  circleAtTop,
  onChange,
  onFocus,
  onBlur,
  mobileDisabled,
  title,
  mode,
  size,
}) {
  return (
    <label
      className={cx(
        'input-radio',
        { disabled, 'mobile-disabled': mobileDisabled },
        { [`mode-${mode}`]: mode },
      )}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex="1"
    >
      <input
        type="radio"
        className={cx('input')}
        disabled={disabled}
        onChange={onChange}
        value={ownValue}
        checked={value === ownValue}
        name={name}
      />
      <span
        className={cx('toggler', {
          checked: value === ownValue,
          'at-top': circleAtTop,
          [`mode-${mode}`]: mode,
          [`toggler-${size}`]: size,
        })}
      />
      {children && (
        <span className={cx('children-container', { [`mode-${mode}`]: mode })} title={title}>
          {children}
        </span>
      )}
    </label>
  );
}
InputRadio.propTypes = {
  children: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  ownValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  name: PropTypes.string,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  circleAtTop: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  mode: PropTypes.oneOf(['default', 'dark']),
  size: PropTypes.oneOf(['small', 'medium']),
};
InputRadio.defaultProps = {
  children: '',
  value: '',
  ownValue: '',
  name: '',
  disabled: false,
  mobileDisabled: false,
  circleAtTop: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  title: undefined,
  mode: 'default',
  size: 'medium',
};
