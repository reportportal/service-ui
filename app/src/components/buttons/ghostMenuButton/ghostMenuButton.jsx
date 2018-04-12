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
import Parser from 'html-react-parser';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import styles from './ghostMenuButton.scss';

const cx = classNames.bind(styles);

export class GhostMenuButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object),
    disabled: PropTypes.bool,
    color: PropTypes.string,
  };
  static defaultProps = {
    title: '',
    items: [],
    disabled: false,
    color: 'topaz',
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
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { title, items, disabled, color } = this.props;
    return (
      <div
        className={cx('ghost-menu-button', {
          disabled,
          [`color-${color}`]: color,
          opened: this.state.opened,
        })}
        ref={(node) => {
          this.node = node;
        }}
        onClick={!disabled ? this.toggleMenu : null}
      >
        <i className={cx('hamburger-icon')}>
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
          <div className={cx('hamburger-icon-part')} />
        </i>
        <span className={cx('title')}>{title}</span>
        <i className={cx('toggle-icon')}>{Parser(ArrowIcon)}</i>
        <div className={cx('menu')}>
          {items.map((item) => (
            <div
              key={item.value}
              className={cx('menu-item', { disabled: item.disabled })}
              onClick={!item.disabled ? item.onClick : null}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
