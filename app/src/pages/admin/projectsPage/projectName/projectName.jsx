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
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import { connect } from 'react-redux';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';
import { SCREEN_XS_MAX_MEDIA } from 'common/constants/screenSizeVariables';
import { navigateToProjectAction } from 'controllers/administrate/projects';
import { showModalAction } from 'controllers/modal';
import { PROJECT_PAGE } from 'controllers/pages';
import { assignedProjectsSelector } from 'controllers/user';
import { messages } from './../messages';
import styles from './projectName.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state, ownProps) => ({
    isAssigned: !!assignedProjectsSelector(state)[ownProps.project.projectName],
  }),
  {
    navigateToProject: navigateToProjectAction,
    showModal: showModalAction,
  },
)
@track()
export class ProjectName extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    navigateToProject: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    isAssigned: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    disableAnalytics: PropTypes.bool,
  };

  static defaultProps = {
    isAssigned: false,
    disableAnalytics: false,
  };

  onProjectClick = (event) => {
    const { tracking, intl, isAssigned, disableAnalytics } = this.props;
    if (!isAssigned && window.matchMedia(SCREEN_XS_MAX_MEDIA).matches) {
      event.preventDefault();
      return;
    }
    const confirmAssignModalOpts = {
      id: 'confirmationModal',
      data: {
        message: intl.formatMessage(messages.assignModalConfirmationText),
        onConfirm: () => {},
        title: intl.formatMessage(messages.assignModalTitle),
        confirmText: intl.formatMessage(messages.assignModalButton),
        cancelText: intl.formatMessage(messages.modalCancelButtonText),
      },
    };
    this.props.navigateToProject({
      project: this.props.project,
      confirmModalOptions: confirmAssignModalOpts,
    });
    if (!disableAnalytics) {
      tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.PROJECT_NAME);
    }
    event.preventDefault();
  };

  render() {
    const {
      project: { projectName },
      isAssigned,
    } = this.props;

    return (
      <Link
        className={cx('name', {
          'mobile-disabled': !isAssigned,
        })}
        to={{
          type: PROJECT_PAGE,
          payload: { projectId: projectName },
        }}
        onClick={this.onProjectClick}
        title={projectName}
      >
        {projectName}
      </Link>
    );
  }
}
