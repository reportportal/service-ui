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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import styles from './ghostMenuButton.scss';

const cx = classNames.bind(styles);

export class GhostMenuButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
        hidden: PropTypes.bool,
        disabled: PropTypes.bool,
        title: PropTypes.string,
        onClick: PropTypes.func,
      }),
    ),
    disabled: PropTypes.bool,
    color: PropTypes.string,
    tooltip: PropTypes.string,
    onClick: PropTypes.func,
  };
  static defaultProps = {
    title: '',
    items: [],
    disabled: false,
    color: 'topaz',
    tooltip: '',
    onClick: () => {},
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
    this.setState({ opened: !this.state.opened });
    this.props.onClick();
  };

  render() {
    const { title, items, disabled, color, tooltip } = this.props;
    return (
      <div
        title={tooltip}
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
          {items
            .filter((item) => !item.hidden)
            .map((item) => (
              <div
                key={item.value}
                className={cx('menu-item', { disabled: item.disabled })}
                title={item.title || ''}
                onClick={
                  !item.disabled
                    ? (e) => {
                        e.stopPropagation();
                        item.onClick();
                        this.toggleMenu();
                      }
                    : null
                }
              >
                <span>{item.label}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }
}
