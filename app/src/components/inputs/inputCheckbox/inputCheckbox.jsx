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
import { CheckIcon } from './checkIcon';

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
    return (
      <label className={cx('input-checkbox')} onFocus={this.props.onFocus} onBlur={this.props.onBlur} tabIndex="1">
        <input
          type="checkbox"
          className={cx('input')}
          checked={this.props.value}
          disabled={this.props.disabled}
          onChange={this.handlerOnChange}
        />
        <CheckIcon
          disabled={this.props.disabled}
          centered={!this.props.children}
          checked={this.props.value}
        />
        { this.props.children && <span className={cx({ 'children-container': true, disabled: this.props.disabled })}>{this.props.children}</span> }
      </label>
    );
  }

}

