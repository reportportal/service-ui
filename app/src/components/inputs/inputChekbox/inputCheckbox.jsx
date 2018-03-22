
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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputCheckbox.scss';

const cx = classNames.bind(styles);

export class InputCheckbox extends Component {
  static propTypes = {
    children: PropTypes.node,
    value: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };
  static defaultProps = {
    children: '',
    value: false,
    disabled: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };
  handlerOnChange = (e) => {
    this.props.onChange(e.target.checked);
  };
  render() {
    const squareClasses = cx({
      square: true,
      centered: !this.props.children,
      checked: this.props.value,
      disabled: this.props.disabled,
    });
    return (
      <label className={cx('input-checkbox')} onFocus={this.props.onFocus} onBlur={this.props.onBlur} tabIndex="1">
        <input
          type="checkbox"
          className={cx('input')}
          checked={this.props.value}
          disabled={this.props.disabled}
          onChange={this.handlerOnChange}
        />
        <div className={squareClasses}>
          <svg className={cx('icon')} xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 8 7">
            <polygon fill={this.props.disabled ? '#999' : '#fff'} fillRule="evenodd" points="0 3.111 3 6.222 8 1.037 7 0 3 4.148 1 2.074" />
          </svg>
        </div>
        { this.props.children && <span className={cx({ 'children-container': true, this.props.disabled })}>{this.props.children}</span> }
      </label>
    );
  }

}
