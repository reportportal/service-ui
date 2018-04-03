/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputCheckbox.scss';
import { CheckIcon } from './checkIcon';

const cx = classNames.bind(styles);

export const InputCheckbox = ({ children, value, disabled, onChange, onFocus, onBlur }) => (
  <label className={cx('input-checkbox')} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
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
    />
    { children && <span className={cx({ 'children-container': true, disabled })}>{children}</span> }
  </label>
  );
InputCheckbox.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};
InputCheckbox.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

