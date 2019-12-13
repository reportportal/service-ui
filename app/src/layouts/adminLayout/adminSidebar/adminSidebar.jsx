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
import { activeProjectSelector } from 'controllers/user';
import { FormattedMessage } from 'react-intl';
import {
  PROJECT_LAUNCHES_PAGE,
  USER_PROFILE_PAGE,
  SERVER_SETTINGS_PAGE,
  PLUGINS_PAGE,
  ALL_USERS_PAGE,
  PROJECTS_PAGE,
} from 'controllers/pages/constants';
import { ALL } from 'common/constants/reservedFilterIds';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { ADMIN_SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { Sidebar } from 'layouts/common/sidebar';
import ProjectsIcon from './img/projects-inline.svg';
import UsersIcon from './img/users-inline.svg';
import SettingsIcon from './img/settings-inline.svg';
import BackIcon from './img/back-inline.svg';
import ProfileIcon from './img/profile-inline.svg';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@track()
export class AdminSidebar extends Component {
  static propTypes = {
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

  handleClickButton = (eventInfo) => () => {
    this.props.onClickNavBtn();
    this.props.tracking.trackEvent(eventInfo);
  };

  createTopSidebarItems = () => [
    {
      onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PROJECTS_BTN),
      link: { type: PROJECTS_PAGE },
      icon: ProjectsIcon,
      message: <FormattedMessage id={'AdminSidebar.allProjects'} defaultMessage={'Projects'} />,
    },
    {
      onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_ALL_USERS_BTN),
      link: { type: ALL_USERS_PAGE },
      icon: UsersIcon,
      message: <FormattedMessage id={'AdminSidebar.allUsers'} defaultMessage={'All Users'} />,
    },
    {
      onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_SERVER_SETTINGS_BTN),
      link: { type: SERVER_SETTINGS_PAGE },
      icon: SettingsIcon,
      message: <FormattedMessage id={'AdminSidebar.settings'} defaultMessage={'Server settings'} />,
    },
    {
      onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PLUGINS_BTN),
      link: { type: PLUGINS_PAGE },
      icon: SettingsIcon,
      message: <FormattedMessage id={'AdminSidebar.plugins'} defaultMessage={'Plugins'} />,
    },
  ];

  createBottomSidebarItems = () => [
    {
      onClick: this.props.onClickNavBtn,
      link: {
        type: PROJECT_LAUNCHES_PAGE,
        payload: { projectId: this.props.activeProject, filterId: ALL },
      },
      icon: BackIcon,
      message: (
        <FormattedMessage id={'AdminSidebar.btnToProject'} defaultMessage={'Back to project'} />
      ),
    },
    {
      onClick: this.props.onClickNavBtn,
      link: { type: USER_PROFILE_PAGE },
      icon: ProfileIcon,
      message: <FormattedMessage id={'AdminSidebar.btnProfile'} defaultMessage={'Profile'} />,
    },
  ];

  render() {
    const topSidebarItems = this.createTopSidebarItems();
    const bottomSidebarItems = this.createBottomSidebarItems();

    return <Sidebar topSidebarItems={topSidebarItems} bottomSidebarItems={bottomSidebarItems} />;
  }
}
