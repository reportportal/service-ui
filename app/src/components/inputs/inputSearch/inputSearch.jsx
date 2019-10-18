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
import Parser from 'html-react-parser';
import SearchIcon from 'common/img/search-icon-inline.svg';
import styles from './inputSearch.scss';

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
  customClassName,
  iconAtRight,
  searchHint,
  onFocus,
  onBlur,
  onKeyUp,
  active,
}) => (
  <div className={cx('input-search', { error, active, disabled }, customClassName)}>
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
  customClassName: PropTypes.string,
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
  customClassName: '',
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
