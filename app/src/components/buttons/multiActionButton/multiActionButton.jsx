/*
 * Copyright 2018 EPAM Systems
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
import track from 'react-tracking';
import React, { Component } from 'react';
import Parser from 'html-react-parser';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import styles from './multiActionButton.scss';

const cx = classNames.bind(styles);

@track()
export class MultiActionButton extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        disabled: PropTypes.bool,
        onClick: PropTypes.func,
      }),
    ),
    menuAtRight: PropTypes.bool,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    color: PropTypes.string,
    toggleMenuEventInfo: PropTypes.object,
  };
  static defaultProps = {
    title: '',
    items: [],
    menuAtRight: false,
    disabled: false,
    color: 'booger',
    onClick: () => {},
    toggleMenuEventInfo: {},
  };

  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  handleOutsideClick = (e) => {
    if (!this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  toggleMenu = () => {
    if (!this.state.opened) {
      this.props.tracking.trackEvent(this.props.toggleMenuEventInfo);
    }
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { title, items, disabled, color, menuAtRight, onClick } = this.props;
    return (
      <div
        className={cx('multi-action-button', {
          disabled,
          [`color-${color}`]: color,
          opened: this.state.opened,
        })}
        ref={(node) => {
          this.node = node;
        }}
      >
        <button className={cx('button-part')} onClick={onClick} disabled={disabled}>
          {title}
        </button>
        <div className={cx('menu-part')} onClick={this.toggleMenu}>
          <i className={cx('toggle-icon')}>{Parser(ArrowIcon)}</i>
        </div>
        <div className={cx('menu', { 'at-right': menuAtRight })}>
          {items.map((item) => (
            <div
              key={item.value}
              className={cx('menu-item', { disabled: item.disabled })}
              onClick={!item.disabled ? item.onClick : null}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
