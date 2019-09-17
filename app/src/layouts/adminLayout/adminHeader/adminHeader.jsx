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
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import { NavLink } from 'components/main/navLink';
import { ALL } from 'common/constants/reservedFilterIds';
import { logoutAction } from 'controllers/auth';
import {
  PROJECT_LAUNCHES_PAGE,
  PROJECTS_PAGE,
  PROJECT_DETAILS_PAGE,
  ALL_USERS_PAGE,
  SERVER_SETTINGS_PAGE,
  SERVER_SETTINGS_TAB_PAGE,
  PLUGINS_PAGE,
  PLUGINS_TAB_PAGE,
  pageSelector,
  projectIdSelector,
} from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { MobileHeader } from 'layouts/common/mobileHeader';
import styles from './adminHeader.scss';

const cx = classNames.bind(styles);

const pageTitles = defineMessages({
  [PROJECTS_PAGE]: {
    id: 'ProjectsPage.title',
    defaultMessage: 'All projects',
  },
  [ALL_USERS_PAGE]: {
    id: 'administrateUsersPage.allUsers',
    defaultMessage: 'All users',
  },
  [SERVER_SETTINGS_PAGE]: {
    id: 'ServerSettingsPage.title',
    defaultMessage: 'Server settings',
  },
  [PLUGINS_PAGE]: {
    id: 'PluginsPage.title',
    defaultMessage: 'Plugins',
  },
});
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
    currentPage: pageSelector(state),
    projectId: projectIdSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
@injectIntl
export class AdminHeader extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
    currentPage: PropTypes.string,
    logout: PropTypes.func,
    intl: intlShape.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  static defaultProps = {
    currentPage: '',
    sideMenuOpened: false,
    logout: () => {},
    toggleSideMenu: () => {},
    projectId: '',
  };

  onClickLogout = () => this.props.logout();

  getHeaderCrumbs = () => {
    const { currentPage, intl, projectId } = this.props;
    switch (currentPage) {
      case PROJECT_DETAILS_PAGE:
        return projectId;
      case SERVER_SETTINGS_TAB_PAGE:
        return intl.formatMessage(pageTitles[SERVER_SETTINGS_PAGE]);
      case PLUGINS_TAB_PAGE:
        return intl.formatMessage(pageTitles[PLUGINS_PAGE]);
      default:
        return pageTitles[currentPage] ? intl.formatMessage(pageTitles[currentPage]) : '';
    }
  };

  render() {
    const { activeProject, sideMenuOpened, toggleSideMenu } = this.props;
    const headerCrumbs = this.getHeaderCrumbs();
    return (
      <header className={cx('header')}>
        <MobileHeader opened={sideMenuOpened} toggleSideMenu={toggleSideMenu} />
        <div className={cx('container')}>
          <h3 className={cx('header-name')}>
            <FormattedMessage id={'AdminHeader.header'} defaultMessage={'Management board'} />
            <span className={cx('header-crumb')}>{headerCrumbs ? ` / ${headerCrumbs}` : ''}</span>
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
            <button className={cx('logout', 'btn')} onClick={this.onClickLogout}>
              <FormattedMessage id={'AdminHeader.btnLogout'} defaultMessage={'Logout'} />
            </button>
          </div>
        </div>
      </header>
    );
  }
}
