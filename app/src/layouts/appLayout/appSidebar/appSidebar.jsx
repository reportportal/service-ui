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
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { activeProjectSelector, activeProjectRoleSelector } from 'controllers/user';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { FormattedMessage } from 'react-intl';
import { CUSTOMER } from 'common/constants/projectRoles';
import { ALL } from 'common/constants/reservedFilterIds';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_USERDEBUG_PAGE,
  LAUNCHES_PAGE,
  PROJECT_FILTERS_PAGE,
  USER_PROFILE_PAGE,
  ADMINISTRATE_PAGE,
} from 'controllers/pages/constants';
import { Sidebar } from 'layouts/common/sidebar';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import DashboardIcon from './img/dashboard-icon-inline.svg';
import LaunchesIcon from './img/launches-icon-inline.svg';
import DebugIcon from './img/debug-icon-inline.svg';
import ProfileIcon from './img/profile-icon-inline.svg';
import AdministrateIcon from './img/administrate-icon-inline.svg';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
  projectRole: activeProjectRoleSelector(state),
}))
@track()
export class AppSidebar extends Component {
  static propTypes = {
    projectRole: PropTypes.string.isRequired,
    onClickNavBtn: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    onClickNavBtn: () => {},
  };

  onClickButton = (eventInfo) => {
    this.props.onClickNavBtn();
    this.props.tracking.trackEvent(eventInfo);
  };

  createTopSidebarItems = () => [
    {
      onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_DASHBOARD_BTN),
      link: { type: PROJECT_DASHBOARD_PAGE, payload: { projectId: this.props.activeProject } },
      icon: DashboardIcon,
      message: <FormattedMessage id={'Sidebar.dashboardsBtn'} defaultMessage={'Dashboard'} />,
    },
    {
      onClick: this.props.onClickNavBtn,
      link: {
        type: LAUNCHES_PAGE,
        payload: { projectId: this.props.activeProject },
      },
      icon: LaunchesIcon,
      message: <FormattedMessage id={'Sidebar.launchesBtn'} defaultMessage={'Launches'} />,
    },
    {
      onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_FILTERS_BTN),
      link: { type: PROJECT_FILTERS_PAGE, payload: { projectId: this.props.activeProject } },
      icon: FiltersIcon,
      message: <FormattedMessage id={'Sidebar.filtersBtn'} defaultMessage={'Filters'} />,
    },
    {
      onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_DEBUG_BTN),
      link: {
        type: PROJECT_USERDEBUG_PAGE,
        payload: { projectId: this.props.activeProject, filterId: ALL },
      },
      icon: DebugIcon,
      message: <FormattedMessage id={'Sidebar.debugBtn'} defaultMessage={'Debug'} />,
    },
  ];

  createBottomSidebarItems = () => [
    {
      onClick: this.props.onClickNavBtn,
      link: { type: USER_PROFILE_PAGE },
      icon: ProfileIcon,
      message: <FormattedMessage id={'Sidebar.profileBtn'} defaultMessage={'Profile'} />,
    },
    {
      onClick: this.props.onClickNavBtn,
      link: { type: ADMINISTRATE_PAGE },
      icon: AdministrateIcon,
      message: <FormattedMessage id={'Sidebar.administrateBtn'} defaultMessage={'Administrate'} />,
    },
  ];

  render() {
    const { projectRole } = this.props;

    const topSidebarItems = this.createTopSidebarItems();
    if (projectRole === CUSTOMER) {
      topSidebarItems.pop();
    }
    const bottomSidebarItems = this.createBottomSidebarItems();

    return <Sidebar topSidebarItems={topSidebarItems} bottomSidebarItems={bottomSidebarItems} />;
  }
}
