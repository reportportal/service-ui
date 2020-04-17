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
import track from 'react-tracking';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { HEADER_EVENTS } from 'components/main/analytics/events';
import {
  userInfoSelector,
  activeProjectSelector,
  assignedProjectsSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { uiExtensionHeaderComponentsSelector } from 'controllers/plugins';
import { canSeeMembers } from 'common/utils/permissions';
import { PROJECT_MEMBERS_PAGE, PROJECT_SETTINGS_PAGE } from 'controllers/pages/constants';
import { NavLink } from 'components/main/navLink';
import { MobileHeader } from 'layouts/common/mobileHeader';
import { ProjectSelector } from './projectSelector';
import { UserBlock } from './userBlock';
import styles from './appHeader.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  user: userInfoSelector(state),
  activeProject: activeProjectSelector(state),
  assignedProjects: assignedProjectsSelector(state),
  accountRole: userAccountRoleSelector(state),
  userRole: activeProjectRoleSelector(state),
  extensionComponents: uiExtensionHeaderComponentsSelector(state),
}))
@track()
export class AppHeader extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    user: PropTypes.object,
    assignedProjects: PropTypes.object,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    extensionComponents: PropTypes.array,
  };

  static defaultProps = {
    user: {},
    assignedProjects: {},
    sideMenuOpened: false,
    toggleSideMenu: () => {},
    extensionComponents: [],
  };

  onClickLink = (eventInfo) => {
    this.props.tracking.trackEvent(eventInfo);
  };

  render() {
    const {
      sideMenuOpened,
      user,
      toggleSideMenu,
      activeProject,
      assignedProjects,
      accountRole,
      userRole,
      extensionComponents,
    } = this.props;
    return (
      <header className={cx('header')}>
        <MobileHeader opened={sideMenuOpened} toggleSideMenu={toggleSideMenu} />
        <div className={cx('projects-block')}>
          <ProjectSelector
            projects={Object.keys(assignedProjects).sort()}
            activeProject={activeProject}
          />
        </div>
        <div className={cx('separator')} />
        <div className={cx('nav-btns-block')}>
          {canSeeMembers(accountRole, userRole) && (
            <NavLink
              to={{ type: PROJECT_MEMBERS_PAGE, payload: { projectId: activeProject } }}
              className={cx('nav-btn', 'members-btn')}
              activeClassName={cx('active')}
              onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_MEMBERS_BTN)}
            />
          )}
          <NavLink
            to={{
              type: PROJECT_SETTINGS_PAGE,
              payload: { projectId: activeProject },
            }}
            className={cx('nav-btn', 'settings-btn')}
            activeClassName={cx('active')}
            onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_SETTINGS_BTN)}
          />
          {extensionComponents.map((extensionComponent) => (
            <div className={cx('nav-btn', 'extension-component')} key={extensionComponent.name}>
              {extensionComponent.component}
            </div>
          ))}
        </div>
        <UserBlock user={user} />
      </header>
    );
  }
}
