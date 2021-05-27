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
import PropTypes from 'prop-types';
import track from 'react-tracking';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
  assignedProjectsSelector,
} from 'controllers/user';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { FormattedMessage } from 'react-intl';
import { CUSTOMER } from 'common/constants/projectRoles';
import { canSeeMembers } from 'common/utils/permissions';
import { ALL } from 'common/constants/reservedFilterIds';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_USERDEBUG_PAGE,
  LAUNCHES_PAGE,
  PROJECT_FILTERS_PAGE,
  PROJECT_TESTRUNNER_PAGE,
  USER_PROFILE_PAGE,
  ADMINISTRATE_PAGE,
  PROJECT_MEMBERS_PAGE,
  PROJECT_SETTINGS_PAGE,
} from 'controllers/pages/constants';
import { uiExtensionSidebarComponentsSelector } from 'controllers/plugins';
import { Sidebar } from 'layouts/common/sidebar';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import DashboardIcon from './img/dashboard-icon-inline.svg';
import LaunchesIcon from './img/launches-icon-inline.svg';
import DebugIcon from './img/debug-icon-inline.svg';
import ProfileIcon from './img/profile-icon-inline.svg';
import AdministrateIcon from './img/administrate-icon-inline.svg';
import MembersIcon from './img/members-icon-inline.svg';
import SettingsIcon from './img/settings-icon-inline.svg';
import { ProjectSelector } from '../../common/projectSelector';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
  assignedProjects: assignedProjectsSelector(state),
  projectRole: activeProjectRoleSelector(state),
  accountRole: userAccountRoleSelector(state),
  extensionComponents: uiExtensionSidebarComponentsSelector(state),
}))
@track()
export class AppSidebar extends Component {
  static propTypes = {
    projectRole: PropTypes.string.isRequired,
    activeProject: PropTypes.string.isRequired,
    accountRole: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    assignedProjects: PropTypes.object,
    extensionComponents: PropTypes.array,
    onClickNavBtn: PropTypes.func,
  };
  static defaultProps = {
    assignedProjects: {},
    extensionComponents: [],
    onClickNavBtn: () => {},
  };

  onClickButton = (eventInfo) => {
    this.props.onClickNavBtn();
    this.props.tracking.trackEvent(eventInfo);
  };

  createTopSidebarItems = () => {
    const {
      projectRole,
      accountRole,
      activeProject,
      onClickNavBtn,
      extensionComponents,
    } = this.props;

    const topItems = [
      {
        onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_DASHBOARD_BTN),
        link: { type: PROJECT_DASHBOARD_PAGE, payload: { projectId: activeProject } },
        icon: DashboardIcon,
        message: <FormattedMessage id={'Sidebar.dashboardsBtn'} defaultMessage={'Dashboards'} />,
      },
      {
        onClick: onClickNavBtn,
        link: {
          type: LAUNCHES_PAGE,
          payload: { projectId: activeProject },
        },
        icon: LaunchesIcon,
        message: <FormattedMessage id={'Sidebar.launchesBtn'} defaultMessage={'Launches'} />,
      },
      {
        onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_FILTERS_BTN),
        link: { type: PROJECT_FILTERS_PAGE, payload: { projectId: activeProject } },
        icon: FiltersIcon,
        message: <FormattedMessage id={'Sidebar.filtersBtn'} defaultMessage={'Filters'} />,
      },
      {
        onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_TESTRUNNER_BTN),
        link: { type: PROJECT_TESTRUNNER_PAGE, payload: { projectId: activeProject } },
        icon: LaunchesIcon,
        message: <FormattedMessage id={'Sidebar.testRunnerBtn'} defaultMessage={'Test Runner'} />,
      },
    ];

    if (projectRole !== CUSTOMER) {
      topItems.push({
        onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_DEBUG_BTN),
        link: {
          type: PROJECT_USERDEBUG_PAGE,
          payload: { projectId: activeProject, filterId: ALL },
        },
        icon: DebugIcon,
        message: <FormattedMessage id={'Sidebar.debugBtn'} defaultMessage={'Debug'} />,
      });
    }

    if (canSeeMembers(accountRole, projectRole)) {
      topItems.push({
        onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_MEMBERS_BTN),
        link: {
          type: PROJECT_MEMBERS_PAGE,
          payload: { projectId: activeProject },
        },
        icon: MembersIcon,
        message: <FormattedMessage id={'Sidebar.membersBnt'} defaultMessage={'Project members'} />,
      });
    }

    topItems.push({
      onClick: () => this.onClickButton(SIDEBAR_EVENTS.CLICK_SETTINGS_BTN),
      link: {
        type: PROJECT_SETTINGS_PAGE,
        payload: { projectId: activeProject },
      },
      icon: SettingsIcon,
      message: <FormattedMessage id={'Sidebar.settingsBnt'} defaultMessage={'Project settings'} />,
    });

    if (extensionComponents.length) {
      extensionComponents.forEach((item) => topItems.push({ ...item, onClick: onClickNavBtn }));
    }

    return topItems;
  };

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
    const { assignedProjects, activeProject } = this.props;
    const topSidebarItems = this.createTopSidebarItems();
    const bottomSidebarItems = this.createBottomSidebarItems();
    const mainBlock = (
      <ProjectSelector
        projects={Object.keys(assignedProjects).sort()}
        activeProject={activeProject}
      />
    );

    return (
      <Sidebar
        mainBlock={mainBlock}
        topSidebarItems={topSidebarItems}
        bottomSidebarItems={bottomSidebarItems}
      />
    );
  }
}
