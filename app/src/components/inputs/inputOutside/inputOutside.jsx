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
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './inputOutside.scss';

const cx = classNames.bind(styles);

export class InputOutside extends Component {
  static propTypes = {
    type: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.string,
    placeholder: PropTypes.string,
    maxLength: PropTypes.string,
    disabled: PropTypes.bool,
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onKeyUp: PropTypes.func,
    refFunction: PropTypes.func,
    active: PropTypes.bool,
    touched: PropTypes.bool,
    error: PropTypes.string,
  };
  static defaultProps = {
    type: 'text',
    value: '',
    icon: '',
    placeholder: '',
    maxLength: '256',
    disabled: false,
    readonly: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    onKeyUp: () => {},
    refFunction: () => {},
    active: false,
    touched: false,
    error: '',
  };

  state = {
    passwordVisible: false,
  };
  getInputType = () => {
    if (this.props.type !== 'password') {
      return this.props.type;
    }
    return this.state.passwordVisible ? 'text' : 'password';
  };
  showPassword = (e) => {
    e.preventDefault();
    !this.state.passwordVisible && this.setState({ passwordVisible: true });
  };
  hidePassword = (e) => {
    e.preventDefault();
    this.state.passwordVisible && this.setState({ passwordVisible: false });
  };
  render() {
    const {
      type,
      value,
      readonly,
      icon,
      placeholder,
      maxLength,
      disabled,
      refFunction,
      onChange,
      onFocus,
      onBlur,
      onKeyUp,
      error,
      active,
      touched,
    } = this.props;
    return (
      <div
        className={cx('input-outside', `type-${type}`, {
          disabled,
          invalid: error && (active || touched),
        })}
      >
        <div className={cx('icon')}>{Parser(icon)}</div>
        <input
          ref={refFunction}
          className={cx('input')}
          type={this.getInputType()}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readonly}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
        />
        {type === 'password' && (
          <div
            className={cx('eye-icon', { opened: this.state.passwordVisible })}
            onMouseDown={this.showPassword}
            onMouseLeave={this.hidePassword}
            onMouseUp={this.hidePassword}
            onTouchStart={this.showPassword}
            onTouchEnd={this.hidePassword}
            onTouchCancel={this.hidePassword}
          />
        )}
      </div>
    );
  }
}
