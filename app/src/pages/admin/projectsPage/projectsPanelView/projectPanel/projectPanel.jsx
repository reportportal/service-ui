import React, { Component } from 'react';
import track from 'react-tracking';
import { injectIntl, intlShape, FormattedRelative } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import { connect } from 'react-redux';
import { PROJECT_PAGE, PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { redirectToProjectAction } from 'controllers/administrate/projects';
import { showModalAction } from 'controllers/modal';
import { Icon } from 'components/main/icon/icon';
import { assignedProjectsSelector } from 'controllers/user';
import { ProjectMenu } from '../../projectMenu';
import { StatisticsItem } from './statisticsItem';
import { ProjectTooltipIcon } from './projectTooltipIcon';
import styles from './projectPanel.scss';
import { UPSA_PROJECT, PERSONAL_PROJECT } from './constants';
import { messages } from './../../messages';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state, ownProps) => ({
    isAssigned: !!assignedProjectsSelector(state)[ownProps.project.projectName],
  }),
  {
    redirectToProject: redirectToProjectAction,
    showModal: showModalAction,
  },
)
@track()
export class ProjectPanel extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    redirectToProject: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    isAssigned: PropTypes.bool,
    nameEventInfo: PropTypes.object,
    statisticEventInfo: PropTypes.object,
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
    const { tracking, nameEventInfo, intl } = this.props;
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
    this.props.redirectToProject({
      project: this.props.project,
      confirmModalOptions: confirmAssignModalOpts,
    });
    tracking.trackEvent(nameEventInfo);
    event.preventDefault();
  };

  getProjectIcon() {
    const {
      intl,
      project: { entryType },
    } = this.props;
    switch (entryType) {
      case UPSA_PROJECT:
        return (
          <span className={cx('header-item')}>
            <ProjectTooltipIcon tooltipContent={intl.formatMessage(messages.linkedTooltip)}>
              <Icon type="icon-linked" />
            </ProjectTooltipIcon>
          </span>
        );
      case PERSONAL_PROJECT:
        return (
          <span className={cx('header-item')}>
            <ProjectTooltipIcon tooltipContent={intl.formatMessage(messages.personalTooltip)}>
              <Icon type="icon-person" />
            </ProjectTooltipIcon>
          </span>
        );
      default:
        return '';
    }
  }

  render() {
    const {
      project: { projectName, entryType, lastRun, launchesQuantity, usersQuantity, organization },
      intl,
    } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('info-block')}>
          <div className={cx('header')}>
            {this.getProjectIcon(entryType)}
            <span className={cx('header-stretch-item', 'gray-text')}>{organization}</span>
            <span className={cx('header-item')}>
              <ProjectMenu project={this.props.project} />
            </span>
          </div>
          <NavLink
            className={cx('name')}
            to={{
              type: PROJECT_PAGE,
              payload: { projectId: projectName },
            }}
            onClick={this.onProjectClick}
          >
            {projectName}
          </NavLink>
          {lastRun && (
            <div className={cx('gray-text')}>
              <FormattedRelative value={new Date(lastRun).getTime()} />
            </div>
          )}
        </div>
        <hr className={cx('hr')} />
        <div className={cx('info-block')}>
          <div className={cx('statistic-items')}>
            <StatisticsItem
              caption={intl.formatMessage(messages.launchesQuantity)}
              value={launchesQuantity}
            />
            <StatisticsItem
              caption={intl.formatMessage(messages.membersQuantity)}
              value={usersQuantity}
            />
            <NavLink
              className={cx('statistic-button')}
              to={{
                type: PROJECT_DETAILS_PAGE,
                payload: { projectId: projectName },
              }}
              onClick={() => this.props.tracking.trackEvent(this.props.statisticEventInfo)}
            >
              <Icon type={'icon-statistics'} />
            </NavLink>
          </div>
        </div>
      </div>
    );
  }
}
