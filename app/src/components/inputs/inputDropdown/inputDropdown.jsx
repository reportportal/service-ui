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
export class InputDropdown extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    options: PropTypes.array,
    multiple: PropTypes.bool,
    selectAll: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    options: [],
    multiple: false,
    selectAll: false,
    disabled: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };
  state = {
    opened: false,
  };
  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
  onClickSelectBlock = (e) => {
    if (!this.props.disabled) {
      this.setState({ opened: !this.state.opened });
      e.stopPropagation();
      this.state.opened
        ? this.props.onBlur()
        : this.props.onFocus();
    }
  };
  handleClickOutside = (e) => {
    if (this.node.contains(e.target) && this.props.multiple) {
      return;
    }
    this.props.onBlur();
  };
  displayedValue() {
    const { multiple, value, options } = this.props;
    let displayedValue;
    if (multiple) {
      return options.filter(option => value.indexOf(option.value) > -1)
        .map(option => option.label)
        .join(', ');
    }
    options.forEach((option) => {
      if (option.value === value) {
        displayedValue = option.label;
      }
    });
    return displayedValue;
  }
  handleChange = (selectedValue) => {
    const { multiple, value, onChange } = this.props;
    if (multiple) {
      if (value.indexOf(selectedValue) > -1) {
        onChange(value.filter(item => item !== selectedValue));
      } else {
        onChange([...value, selectedValue]);
      }
    } else {
      onChange(selectedValue);
    }
    this.setState({ opened: !this.state.opened });
  };
  handleAllClick = () => {
    if (this.props.value.length !== this.props.options.length) {
      this.props.onChange(this.props.options.filter(item => !item.disabled)
        .map(item => item.value));
    } else {
      this.props.onChange([]);
    }
  };

  renderOptions() {
    return this.props.options.map((option) => {
      let selected;
      this.props.multiple ?
        selected = this.props.value.indexOf(option.value) > -1 :
        selected = option.value === this.props.value;
      return (
        <DropdownOption
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          selected={selected}
          label={option.label}
          multiple={this.props.multiple}
          onChange={option.disabled ? () => {} : this.handleChange}
        />
      );
    });
  }

  render() {
    return (
      <div ref={(node) => { this.node = node; }} className={cx('dropdown', { opened: this.state.opened })}>
        <div className={cx({ 'select-block': true, disabled: this.props.disabled })} onClick={this.onClickSelectBlock}>
          <span className={cx('value')}>{ this.displayedValue() }</span>
          <span className={cx('arrow')} />
        </div>
        <div className={cx('select-list')}>
          {
            (this.props.multiple && this.props.selectAll) && <div className={cx('select-all-block')} onClick={this.handleAllClick}><span className={cx('select-all')} >All</span></div>
          }
          { this.renderOptions() }
        </div>
      </div>
    );
  }
}
