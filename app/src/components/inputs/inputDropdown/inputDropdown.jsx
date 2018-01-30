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
import styles from './inputDropdown.scss';
import { DropdownOption } from './inputDropdownOption/inputDropdownOption';

const cx = classNames.bind(styles);

// eslint-disable-next-line react/prefer-stateless-function
export class Dropdown extends Component {
  static propTypes = {
    displayedValue: PropTypes.string,
    options: PropTypes.array,
    multiple: PropTypes.bool,
    selectAll: PropTypes.bool,
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    displayedValue: '',
    options: [],
    multiple: false,
    selectAll: false,
    disabled: false,
    active: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };
  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
  onClickSelectBlock = (e) => {
    e.stopPropagation();
    this.props.active
      ? (() => this.props.multiple && this.props.onBlur())()
      : this.props.onFocus();
  };
  handleClickOutside = (e) => {
    if (this.node.contains(e.target) && this.props.multiple) {
      return;
    }
    this.props.onBlur();
  };
  renderOptions() {
    return this.props.options.map(option => (
      <DropdownOption
        key={option.id}
        id={option.id}
        disabled={option.disabled}
        active={option.active}
        text={option.text}
        multiple={this.props.multiple}
      />
    ));
  }

  render() {
    const classes = cx({
      dropdown: true,
      opened: this.props.active,
    });
    return (
      <div ref={(node) => { this.node = node; }} className={classes}>
        <div className={cx({ 'select-block': true, disabled: this.props.disabled })} onClick={this.onClickSelectBlock}>
          <span className={cx('value')}>{ this.props.displayedValue }</span>
          <span className={cx('arrow')} />
        </div>
        <div className={cx('select-list')}>
          {
            (this.props.multiple && this.props.selectAll)
              ? <div className={cx('select-all-block')}><span className={cx('select-all')}>All</span></div>
              : null
          }
          { this.renderOptions() }
        </div>
      </div>
    );
  }
}
