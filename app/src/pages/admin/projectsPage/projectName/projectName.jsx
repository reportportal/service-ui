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
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import { connect } from 'react-redux';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';
import { SCREEN_XS_MAX_MEDIA } from 'common/constants/screenSizeVariables';
import { navigateToProjectAction } from 'controllers/administrate/projects';
import { PROJECT_PAGE } from 'controllers/pages';
import {
  assignedProjectsSelector,
  assignedOrganizationsSelector,
  setActiveProjectKeyAction,
  userRolesSelector,
} from 'controllers/user';
import { MANAGER, userRolesType } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import styles from './projectName.scss';

const cx = classNames.bind(styles);

@connect(
  (state, ownProps) => ({
    isProjectAssigned: !!assignedProjectsSelector(state)[ownProps.project.projectKey],
    isOrganizationAssigned: Object.keys(assignedOrganizationsSelector(state)).some(
      ({ organizationId }) => organizationId === ownProps.project.organizationId,
    ),
    userRoles: userRolesSelector(state),
  }),
  {
    navigateToProject: navigateToProjectAction,
    setActiveProjectKey: setActiveProjectKeyAction,
  },
)
@track()
export class ProjectName extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    navigateToProject: PropTypes.func.isRequired,
    setActiveProjectKey: PropTypes.func.isRequired,
    isOrganizationAssigned: PropTypes.bool,
    isProjectAssigned: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    disableAnalytics: PropTypes.bool,
    userRoles: userRolesType,
  };

  static defaultProps = {
    isOrganizationAssigned: false,
    isProjectAssigned: false,
    disableAnalytics: false,
    userRoles: {},
  };

  onProjectClick = (event) => {
    const {
      tracking,
      isOrganizationAssigned,
      isProjectAssigned,
      disableAnalytics,
      project,
      userRoles: { userRole, organizationRole },
      setActiveProjectKey,
      navigateToProject,
    } = this.props;

    const isAdmin = userRole === ADMINISTRATOR;
    const isManager = organizationRole === MANAGER;
    const isNotPermission =
      !isProjectAssigned && (!isAdmin || (isManager && isOrganizationAssigned));

    if (isNotPermission && window.matchMedia(SCREEN_XS_MAX_MEDIA).matches) {
      event.preventDefault();
      return;
    }

    setActiveProjectKey(project.projectKey);
    navigateToProject({ project });

    if (!disableAnalytics) {
      tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.PROJECT_NAME);
    }
    event.preventDefault();
  };

  render() {
    const {
      project: { projectSlug, organizationSlug, projectName },
      isProjectAssigned,
    } = this.props;

    return (
      <Link
        className={cx('name', {
          'mobile-disabled': !isProjectAssigned,
        })}
        to={{
          type: PROJECT_PAGE,
          payload: {
            projectSlug,
            organizationSlug,
          },
        }}
        onClick={this.onProjectClick}
        title={projectName}
      >
        {projectName}
      </Link>
    );
  }
}
