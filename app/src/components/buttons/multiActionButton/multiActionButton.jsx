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
        title: PropTypes.string,
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
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
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
              title={item.title || ''}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
