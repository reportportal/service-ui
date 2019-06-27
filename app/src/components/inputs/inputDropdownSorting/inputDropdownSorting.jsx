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
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';

import ArrowIcon from 'common/img/arrow-down-inline.svg';
import styles from './inputDropdownSorting.scss';
import { DropdownSortingOption } from './inputDropdownSortingOption/inputDropdownSortingOption';

const cx = classNames.bind(styles);

export class InputDropdownSorting extends Component {
  static propTypes = {
    width: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    options: PropTypes.array,
    sortingMode: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    touched: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    mobileDisabled: PropTypes.bool,
    transparent: PropTypes.bool,
  };

  static defaultProps = {
    width: '100%',
    value: '',
    options: [],
    sortingMode: false,
    disabled: false,
    error: '',
    touched: false,
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    mobileDisabled: false,
    transparent: false,
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
    const { disabled, onFocus, onBlur } = this.props;
    const { opened } = this.state;

    if (!disabled) {
      this.setState({ opened: !opened });
      e.stopPropagation();
      opened ? onBlur() : onFocus();
    }
  };

  setRef = (node) => {
    this.node = node;
  };

  handleClickOutside = (e) => {
    if (!this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
      this.props.onBlur();
    }
  };

  displayedValue() {
    const { value, options } = this.props;

    let displayedValue = '';
    options.forEach((option) => {
      if (option.value === value) {
        displayedValue = option.label;
      }
    });
    return Parser(displayedValue);
  }

  handleChange = (selectedValue) => {
    this.props.onChange(selectedValue);
    this.setState({ opened: !this.state.opened });
  };

  renderOptions() {
    const { options, value } = this.props;

    return options.map((option) => {
      const selected = option.value === value;

      return (
        <DropdownSortingOption
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          selected={selected}
          label={option.label}
          subOption={!!option.groupRef}
          onChange={(!option.disabled && this.handleChange) || null}
        />
      );
    });
  }

  render() {
    const { error, touched, disabled, mobileDisabled, transparent, sortingMode } = this.props;
    const { opened } = this.state;

    return (
      <div ref={this.setRef} className={cx('dropdown', { opened })}>
        <div
          className={cx('select-block', {
            disabled,
            error,
            touched,
            'mobile-disabled': mobileDisabled,
            transparent,
          })}
          onClick={this.onClickSelectBlock}
        >
          <span className={cx('value')}>{this.displayedValue()}</span>
          <span className={cx('arrow', { asc: sortingMode })}>{Parser(ArrowIcon)}</span>
        </div>
        <div className={cx('select-list')}>{this.renderOptions()}</div>
      </div>
    );
  }
}
