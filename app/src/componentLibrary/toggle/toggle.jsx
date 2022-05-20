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
import styles from './toggle.scss';

const cx = classNames.bind(styles);

export const Toggle = ({
  children,
  value,
  onChange,
  onFocus,
  onBlur,
  className,
  disabled,
  title,
}) => (
  // eslint-disable-next-line
  <label
    title={title}
    onFocus={onFocus}
    onBlur={onBlur}
    className={cx('toggle', className, { disabled })}
  >
    <input
      onChange={onChange}
      checked={value}
      disabled={disabled}
      className={cx('input')}
      type="checkbox"
    />
    <div className={cx('slider', 'round')} />
    {children && <span className={cx('children-container')}>{children}</span>}
  </label>
);

Toggle.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

Toggle.defaultProps = {
  children: null,
  value: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
  disabled: false,
  title: '',
};
