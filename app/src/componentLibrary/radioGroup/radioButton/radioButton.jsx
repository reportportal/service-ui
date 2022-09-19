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
import styles from './radioButton.scss';

const cx = classNames.bind(styles);

export const RadioButton = ({
  option,
  value,
  disabled,
  onChange,
  onFocus,
  onBlur,
  className,
  variant,
  mobileDisabled,
}) => {
  const isChecked = option.value === value;

  return (
    // eslint-disable-next-line
    <label
      className={cx(variant, className, 'radio-button', {
        disabled,
        'mobile-disabled': mobileDisabled,
      })}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex="1"
    >
      <input
        type="radio"
        className={cx('input')}
        disabled={disabled}
        onChange={onChange}
        value={option.value}
        checked={isChecked}
      />
      <span
        className={cx(variant, 'toggler', {
          disabled,
          checked: isChecked,
        })}
      />
      <span className={cx(variant, 'children-container')}>{option.label}</span>
    </label>
  );
};
RadioButton.propTypes = {
  variant: PropTypes.string,
  option: PropTypes.string,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  mobileDisabled: PropTypes.bool,
};
RadioButton.defaultProps = {
  variant: 'light',
  option: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
  mobileDisabled: false,
};
