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
import styles from './inputCheckbox.scss';
import { CheckIcon } from './checkIcon';

const cx = classNames.bind(styles);

export const InputCheckbox = ({
  children,
  value,
  disabled,
  onChange,
  onFocus,
  onBlur,
  iconTransparentBackground,
  className,
  darkView,
  responsive,
}) => (
  <label
    className={cx('input-checkbox', className)}
    onFocus={onFocus}
    onBlur={onBlur}
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/tabindex-no-positive
    tabIndex="1"
  >
    <input
      type="checkbox"
      className={cx('input')}
      checked={value}
      disabled={disabled}
      onChange={onChange}
    />
    <CheckIcon
      disabled={disabled}
      centered={!children}
      checked={value}
      transparentBackground={iconTransparentBackground}
      darkView={darkView}
      responsive={responsive}
    />
    {children && (
      <span className={cx('children-container', { disabled, responsive })}>{children}</span>
    )}
  </label>
);
InputCheckbox.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  iconTransparentBackground: PropTypes.bool,
  className: PropTypes.string,
  darkView: PropTypes.bool,
  responsive: PropTypes.bool,
};
InputCheckbox.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  iconTransparentBackground: false,
  className: '',
  darkView: false,
  responsive: false,
};
