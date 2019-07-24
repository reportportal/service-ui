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
