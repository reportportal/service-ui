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
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import {
  PROJECT_LAUNCHES_PAGE,
  USER_PROFILE_PAGE,
  SERVER_SETTINGS_PAGE,
  PLUGINS_PAGE,
  ALL_USERS_PAGE,
  PROJECTS_PAGE,
  PLUGIN_UI_EXTENSION_ADMIN_PAGE,
} from 'controllers/pages/constants';
import { ALL } from 'common/constants/reservedFilterIds';
import PropTypes from 'prop-types';
import track, { useTracking } from 'react-tracking';
import { uiExtensionAdminPagesSelector } from 'controllers/plugins/uiExtensions';
import { ADMIN_SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { Sidebar } from 'layouts/common/sidebar';
import { projectOrganizationSlugSelector } from 'controllers/project/selectors';
import { activeProjectKeySelector } from 'controllers/user/selectors';
import ProjectsIcon from './img/projects-inline.svg';
import UsersIcon from './img/all-users-inline.svg';
import SettingsIcon from './img/server-settings-inline.svg';
import PluginsIcon from './img/plugins-inline.svg';
import BackIcon from './img/back-inline.svg';
import ProfileIcon from './img/profile-inline.svg';
import styles from './adminSidebar.scss';

const cx = classNames.bind(styles);

const BackToProject = ({ organizationSlug, projectKey }) => {
  const { trackEvent } = useTracking();
  return (
    <Link
      className={cx('back-to-project')}
      onClick={() => trackEvent(ADMIN_SIDEBAR_EVENTS.CLICK_BACK_TO_PROJECT_BTN)}
      to={{
        type: PROJECT_LAUNCHES_PAGE,
        payload: {
          projectKey,
          filterId: ALL,
          organizationSlug,
        },
      }}
    >
      <i className={cx('icon')}>{Parser(BackIcon)}</i>
    </Link>
  );
};
BackToProject.propTypes = {
  organizationSlug: PropTypes.string.isRequired,
  projectKey: PropTypes.string.isRequired,
};

const BackToProjectWithTooltip = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(BackToProject);

@connect((state) => ({
  extensions: uiExtensionAdminPagesSelector(state),
  organizationSlug: projectOrganizationSlugSelector(state),
  projectKey: activeProjectKeySelector(state),
}))
@track()
export class AdminSidebar extends Component {
  static propTypes = {
    onClickNavBtn: PropTypes.func,
    organizationSlug: PropTypes.string.isRequired,
    projectKey: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    extensions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        buttonTitle: PropTypes.string,
        buttonIcon: PropTypes.string,
      }),
    ),
  };
  static defaultProps = {
    onClickNavBtn: () => {},
    extensions: [],
  };

  handleClickButton = (eventInfo) => () => {
    this.props.onClickNavBtn();
    if (eventInfo) {
      this.props.tracking.trackEvent(eventInfo);
    }
  };

  createTopSidebarItems = () => {
    const items = [
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
        message: (
          <FormattedMessage id={'AdminSidebar.settings'} defaultMessage={'Server settings'} />
        ),
      },
      {
        onClick: this.handleClickButton(ADMIN_SIDEBAR_EVENTS.CLICK_PLUGINS_BTN),
        link: { type: PLUGINS_PAGE },
        icon: PluginsIcon,
        message: <FormattedMessage id={'AdminSidebar.plugins'} defaultMessage={'Plugins'} />,
      },
    ];
    const extensionItems = this.props.extensions.map((extension) => ({
      onClick: this.handleClickButton(),
      link: { type: PLUGIN_UI_EXTENSION_ADMIN_PAGE, payload: { pluginPage: extension.name } },
      icon: extension.buttonIcon,
      message: extension.buttonLabel || extension.name,
    }));
    return [...items, ...extensionItems];
  };

  createBottomSidebarItems = () => {
    const { organizationSlug, projectKey } = this.props;

    return [
      {
        onClick: this.props.onClickNavBtn,
        link: {
          type: PROJECT_LAUNCHES_PAGE,
          payload: {
            projectKey,
            filterId: ALL,
            organizationSlug,
          },
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
  };

  render() {
    const { organizationSlug, projectKey } = this.props;
    const topSidebarItems = this.createTopSidebarItems();
    const bottomSidebarItems = this.createBottomSidebarItems();
    const mainBlock = (
      <BackToProjectWithTooltip
        organizationSlug={organizationSlug}
        projectKey={projectKey}
        className={cx('back-to-project-tooltip')}
        tooltipContent={
          <FormattedMessage id={'AdminSidebar.btnToProject'} defaultMessage={'Back to project'} />
        }
        preventParsing
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
