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
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { SidebarButton } from 'components/buttons/sidebarButton/sidebarButton';
import PropTypes from 'prop-types';
import styles from './sidebar.scss';
import DashboardIcon from './img/dashboard-icon-inline.svg';
import LaunchesIcon from './img/launches-icon-inline.svg';
import FiltersIcon from './img/filters-icon-inline.svg';
import DebugIcon from './img/debug-icon-inline.svg';
import ProfileIcon from './img/profile-icon-inline.svg';
import AdministrateIcon from './img/administrate-icon-inline.svg';
import LogoutIcon from './img/logout-icon-inline.svg';
import {
	PROJECT_DASHBOARD_PAGE,
	PROJECT_LAUNCHES_PAGE,
	PROJECT_FILTERS_PAGE,
	PROJECT_USERDEBUG_PAGE,
	USER_PROFILE_PAGE,
	ADMINISTRATE_PAGE,
	LOGIN_PAGE
} from 'controllers/pages/constants';

const cx = classNames.bind(styles);

@connect(
  state => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
export class Sidebar extends Component {
  static propTypes = {
    onClickNavBtn: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
    logout: PropTypes.func,
  };
  static defaultProps = {
    onClickNavBtn: () => {},
    logout: () => {},
  };
  render() {
	const { activeProject } = this.props;
    return (
      <div className={cx('sidebar')} >
        <div className={cx('top-block')}>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>
            <SidebarButton 
				link={{type:PROJECT_DASHBOARD_PAGE, payload: {projectId: activeProject}}}
				icon={DashboardIcon}>
              <FormattedMessage id={'Sidebar.dashboardsBtn'} defaultMessage={'Dashboard'} />
            </SidebarButton>
          </div>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>

            <SidebarButton 
				link={{type:PROJECT_LAUNCHES_PAGE, payload: {projectId: activeProject}}}
				icon={LaunchesIcon}>
              <FormattedMessage id={'Sidebar.launchesBtn'} defaultMessage={'Launches'} />
            </SidebarButton>
          </div>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>
            <SidebarButton 
				link={{type:PROJECT_FILTERS_PAGE, payload: {projectId: activeProject}}}
				icon={FiltersIcon}>
              <FormattedMessage id={'Sidebar.filtersBtn'} defaultMessage={'Filters'} />
            </SidebarButton>
          </div>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>
            <SidebarButton
				link={{type:PROJECT_USERDEBUG_PAGE, payload: {projectId: activeProject}}}
				icon={DebugIcon}>
              <FormattedMessage id={'Sidebar.debugBtn'} defaultMessage={'Debug'} />
            </SidebarButton>
          </div>
        </div>
        <div className={cx('bottom-block')}>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>
            <SidebarButton
				link={{type:USER_PROFILE_PAGE}}
				icon={ProfileIcon}
				bottom>
              <FormattedMessage id={'Sidebar.profileBtn'} defaultMessage={'Profile'} />
            </SidebarButton>
          </div>
          <div className={cx('sidebar-btn')} onClick={this.props.onClickNavBtn}>
            <SidebarButton
				link={{type:ADMINISTRATE_PAGE}}
				icon={AdministrateIcon}
				bottom>
              <FormattedMessage id={'Sidebar.administrateBtn'} defaultMessage={'Administrate'} />
            </SidebarButton>
          </div>
          <div className={cx('sidebar-btn')} onClick={this.props.logout}>
            <SidebarButton
				link={{type:LOGIN_PAGE}}
				icon={LogoutIcon}
		        bottom>
              <FormattedMessage id={'Sidebar.logoutBtn'} defaultMessage={'Logout'} />
            </SidebarButton>
          </div>
        </div>
      </div>
    );
  }
}
