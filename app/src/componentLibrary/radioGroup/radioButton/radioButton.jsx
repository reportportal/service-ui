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

export const RadioButton = ({ option, value, onChange, onFocus, onBlur, className, variant }) => {
  const isChecked = option.value === value;

  return (
    // eslint-disable-next-line
    <label
      className={cx(variant, className, 'radio-button', {
        disabled: option.disabled,
      })}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex="0"
    >
      <input
        type="radio"
        className={cx('input')}
        disabled={option.disabled}
        onChange={onChange}
        value={option.value}
        checked={isChecked}
      />
      <span
        className={cx(variant, 'toggler', {
          disabled: option.disabled,
          checked: isChecked,
        })}
      />
      <span className={cx(variant, 'children-container')}>{option.label}</span>
    </label>
  );
};
RadioButton.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  option: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
};
RadioButton.defaultProps = {
  variant: 'light',
  option: {},
  value: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
};
