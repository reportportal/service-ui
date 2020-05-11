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
    autoComplete: PropTypes.string,
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
    autoComplete: undefined,
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
      autoComplete,
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
          autoComplete={autoComplete}
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
