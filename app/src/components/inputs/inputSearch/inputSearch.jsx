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
import Parser from 'html-react-parser';
import styles from './inputSearch.scss';
import SearchIcon from './img/search-icon-inline.svg';

const cx = classNames.bind(styles);

export const InputSearch = ({
  type,
  value,
  error,
  placeholder,
  maxLength,
  disabled,
  refFunction,
  onChange,
  className,
  iconAtRight,
  searchHint,
  onFocus,
  onBlur,
  onKeyUp,
  active,
}) => (
  <div className={cx('input-search', { error, active, disabled })}>
    <div className={cx('icon', { 'at-right': iconAtRight })}>{Parser(SearchIcon)}</div>
    <input
      ref={refFunction}
      type={type}
      className={cx('input', `type-${type}`, className)}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyUp={onKeyUp}
    />
    {searchHint && <div className={cx('search-hint')}>{searchHint}</div>}
  </div>
);

InputSearch.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  maxLength: PropTypes.string,
  className: PropTypes.string,
  iconAtRight: PropTypes.bool,
  searchHint: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  refFunction: PropTypes.func,
};

InputSearch.defaultProps = {
  type: 'text',
  value: '',
  placeholder: '',
  maxLength: '256',
  className: '',
  iconAtRight: false,
  searchHint: '',
  active: false,
  disabled: false,
  error: '',
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyUp: () => {},
  refFunction: () => {},
};
