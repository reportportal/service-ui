// /*
//  * Copyright 2018 EPAM Systems
//  *
//  *
//  * This file is part of EPAM Report Portal.
//  * https://github.com/reportportal/service-ui
//  *
//  * Report Portal is free software: you can redistribute it and/or modify
//  * it under the terms of the GNU General Public License as published by
//  * the Free Software Foundation, either version 3 of the License, or
//  * (at your option) any later version.
//  *
//  * Report Portal is distributed in the hope that it will be useful,
//  * but WITHOUT ANY WARRANTY; without even the implied warranty of
//  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  * GNU General Public License for more details.
//  *
//  * You should have received a copy of the GNU General Public License
//  * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
//  */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link';
import { FormattedMessage } from 'react-intl';
import { ALL } from 'common/constants/reservedFilterIds';
import { logoutAction } from 'controllers/auth';
import { PROJECT_LAUNCHES_PAGE } from 'controllers/pages/constants';
import { activeProjectSelector } from 'controllers/user';
import { MobileHeader } from 'layouts/common/mobileHeader';
import styles from './adminHeader.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
export class AdminHeader extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
    adminHeaderCrumb: PropTypes.string,
    logout: PropTypes.func,
  };

  static defaultProps = {
    adminHeaderCrumb: '',
    sideMenuOpened: false,
    logout: () => {},
    toggleSideMenu: () => {},
  };

  render() {
    const { activeProject, sideMenuOpened, adminHeaderCrumb, toggleSideMenu, logout } = this.props;
    return (
      <header className={cx('header')}>
        <MobileHeader opened={sideMenuOpened} toggleSideMenu={toggleSideMenu} />
        <div className={cx('container')}>
          <h3 className={cx('header-name')}>
            <FormattedMessage id={'AdminHeader.header'} defaultMessage={'Management board'} />
            <span className={cx('header-crumb')}>{adminHeaderCrumb}</span>
          </h3>
          <div className={cx('admin-header-controls')}>
            <NavLink
              className={cx('back-to-project', 'btn')}
              to={{
                type: PROJECT_LAUNCHES_PAGE,
                payload: { projectId: activeProject, filterId: ALL },
              }}
            >
              <FormattedMessage
                id={'AdminHeader.btnToProject'}
                defaultMessage={'Back to project'}
              />
            </NavLink>
            <button className={cx('logout', 'btn')} onClick={logout}>
              <FormattedMessage id={'AdminHeader.btnLogout'} defaultMessage={'Logout'} />
            </button>
          </div>
        </div>
      </header>
    );
  }
}
