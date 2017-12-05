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
import styles from './Input.scss';

const cx = classNames.bind(styles);

const Input = ({ type, value, placeholder, maxLength, disabled, onChange, onFocus, onBlur }) => {
  const classes = cx({
    input: true,
    disabled,
  });
  const handlerOnChange = (e) => {
    onChange({ value: e.target.value });
  };
  return (
    <input
      type={type}
      className={classes}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      onChange={handlerOnChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

Input.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  maxLength: '254',
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

export default Input;
