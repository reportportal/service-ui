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
import styles from './checkbox.scss';

const cx = classNames.bind(styles);

export const Checkbox = ({
  children,
  disabled,
  onChange,
  onFocus,
  onBlur,
  className,
  value,
  variant,
  dataAutomationId,
}) => {
  const handleKeyDown = ({ keyCode }) => {
    const enterKeyCode = 13;
    if (keyCode === enterKeyCode) {
      onChange(!value);
    }
  };

  const handleChange = () => {
    onChange(!value);
  };

  return (
    // eslint-disable-next-line
    <label
      id="chk1-label"
      className={cx(variant, className, {
        disabled,
      })}
      onFocus={onFocus}
      onBlur={onBlur}
      data-automation-id={dataAutomationId}
    >
      <input
        type="checkbox"
        className={cx('input')}
        disabled={disabled}
        onChange={handleChange}
        checked={value}
      />
      <span
        aria-labelledby="chk1-label"
        role="checkbox"
        aria-checked={value}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? '' : '0'}
        className={cx('checkbox', {
          disabled,
        })}
      />
      {children && <span className={cx('children-container', { disabled })}>{children}</span>}
    </label>
  );
};
Checkbox.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  dataAutomationId: PropTypes.string,
};
Checkbox.defaultProps = {
  variant: 'light',
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
  dataAutomationId: '',
};
