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
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import track from 'react-tracking';
import { HEADER_EVENTS } from 'components/main/analytics/events';
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
@track()
export class AdminHeader extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
    currentPage: PropTypes.string,
    logout: PropTypes.func,
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    currentPage: '',
    sideMenuOpened: false,
    logout: () => {},
    toggleSideMenu: () => {},
    projectId: '',
  };

  onClickLogout = () => {
    this.props.logout();
    this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_LOGOUT_LINK);
  };

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
