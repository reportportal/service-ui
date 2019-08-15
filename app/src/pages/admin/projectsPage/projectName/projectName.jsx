import React, { Component } from 'react';
import track from 'react-tracking';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Link from 'redux-first-router-link';
import { connect } from 'react-redux';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
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
    intl: intlShape.isRequired,
    navigateToProject: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    isAssigned: PropTypes.bool,
    nameEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    nameEventInfo: {},
    statisticEventInfo: {},
    isAssigned: false,
  };

  onProjectClick = (event) => {
    const { tracking, nameEventInfo, intl, isAssigned } = this.props;
    if (!isAssigned && window.matchMedia(SCREEN_XS_MAX).matches) {
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
    tracking.trackEvent(nameEventInfo);
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
