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
import { connect } from 'react-redux';
import { logoutAction } from 'controllers/auth';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { SidebarButton } from 'components/buttons/sidebarButton/sidebarButton';
import { LOGIN_PAGE } from 'controllers/pages/constants';
import PropTypes from 'prop-types';
import styles from './sidebar.scss';
import LogoutIcon from '../img/logout-inline.svg';

const cx = classNames.bind(styles);

@connect(null, {
  logout: logoutAction,
})
export class Sidebar extends Component {
  static propTypes = {
    logout: PropTypes.func,
    topSidebarItems: PropTypes.array,
    bottomSidebarItems: PropTypes.array,
  };
  static defaultProps = {
    logout: () => {},
    topSidebarItems: [],
    bottomSidebarItems: [],
  };

  render() {
    const { topSidebarItems, bottomSidebarItems } = this.props;

    return (
      <aside className={cx('sidebar')}>
        <div className={cx('top-block')}>
          {topSidebarItems.map((item) => (
            <div key={item.link.type} className={cx('sidebar-btn')} onClick={item.onClick}>
              <SidebarButton link={item.link} icon={item.icon}>
                {item.message}
              </SidebarButton>
            </div>
          ))}
        </div>
        <div className={cx('bottom-block')}>
          {bottomSidebarItems.map((item) => (
            <div key={item.link.type} className={cx('sidebar-btn')} onClick={item.onClick}>
              <SidebarButton link={item.link} icon={item.icon} bottom>
                {item.message}
              </SidebarButton>
            </div>
          ))}
          <div className={cx('sidebar-btn')} onClick={this.props.logout}>
            <SidebarButton link={{ type: LOGIN_PAGE }} icon={LogoutIcon} bottom>
              <FormattedMessage id={'Sidebar.logoutBtn'} defaultMessage={'Logout'} />
            </SidebarButton>
          </div>
        </div>
      </aside>
    );
  }
}
