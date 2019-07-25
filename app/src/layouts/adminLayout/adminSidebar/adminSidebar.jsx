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
import { Sidebar } from 'layouts/common/sidebar';
import ProjectsIcon from './img/projects-inline.svg';
import UsersIcon from './img/users-inline.svg';
import SettingsIcon from './img/settings-inline.svg';
import BackIcon from './img/back-inline.svg';
import ProfileIcon from './img/profile-inline.svg';

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class AdminSidebar extends Component {
  static propTypes = {
    onClickNavBtn: PropTypes.func,
    activeProject: PropTypes.string.isRequired,
  };
  static defaultProps = {
    onClickNavBtn: () => {},
  };

  createTopSidebarItems = () => [
    {
      onClick: this.props.onClickNavBtn,
      link: { type: PROJECTS_PAGE },
      icon: ProjectsIcon,
      message: <FormattedMessage id={'AdminSidebar.allProjects'} defaultMessage={'Projects'} />,
    },
    {
      onClick: this.props.onClickNavBtn,
      link: { type: ALL_USERS_PAGE },
      icon: UsersIcon,
      message: <FormattedMessage id={'AdminSidebar.allUsers'} defaultMessage={'All Users'} />,
    },
    {
      onClick: this.props.onClickNavBtn,
      link: { type: SERVER_SETTINGS_PAGE },
      icon: SettingsIcon,
      message: <FormattedMessage id={'AdminSidebar.settings'} defaultMessage={'Server settings'} />,
    },
    {
      onClick: this.props.onClickNavBtn,
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
