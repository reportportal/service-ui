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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { Notification } from 'components/main/notification';
import { Sidebar } from './sidebar';
import { Header } from './header';
import styles from './appLayout.scss';

const cx = classNames.bind(styles);

export class AppLayout extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };
  static defaultProps = {
    children: null,
  };
  constructor(props) {
    super(props);
    window.addEventListener('resize', this.windowResizeHandler, false);
  }
  state = {
    sideMenuOpened: false,
  };
  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizeHandler, false);
  }
  windowResizeHandler = () => {
    if (this.state.sideMenuOpened && (window.innerWidth > 767)) {
      this.setState({ sideMenuOpened: false });
    }
  };
  toggleSideMenu = () => {
    this.setState({ sideMenuOpened: !this.state.sideMenuOpened });
  };

  render() {
    return (
      <ScrollWrapper>
        <div className={cx('app-container')}>
          <div className={cx({ 'slide-container': true, 'side-menu-opened': this.state.sideMenuOpened })}>
            <div className={cx('sidebar-container')}>
              <div className={cx('corner-area')} />
              <Sidebar
                onClickNavBtn={() => {
                  this.state.sideMenuOpened && this.setState({ sideMenuOpened: false });
                }}
              />
            </div>
            <div className={cx('content')}>
              <ScrollWrapper>
                <div className={cx('header-container')}>
                  <Header
                    isSideMenuOpened={this.state.sideMenuOpened}
                    toggleSideMenu={this.toggleSideMenu}
                  />
                </div>
                <div className={cx('page-container')}>
                  {this.props.children}
                </div>
              </ScrollWrapper>
              <div className={cx({ 'sidebar-close-area': true, visible: this.state.sideMenuOpened })} onClick={this.toggleSideMenu} />
            </div>
          </div>
          <Notification />
        </div>
      </ScrollWrapper>
    );
  }
}
