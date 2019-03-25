import React, { Component } from 'react';
import track from 'react-tracking';
import { injectIntl, intlShape, defineMessages, FormattedRelative } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link';
import { PROJECT_PAGE, PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { DotsMenuButton, SEPARATOR_ITEM, DANGER_ITEM } from 'components/buttons/dotsMenuButton';
import { Icon } from 'components/main/icon/icon';
import { assignedProjectsSelector } from 'controllers/user';
import { StatisticsItem } from './statisticsItem';
import { ProjectTooltipIcon } from './projectTooltipIcon';
import styles from './projectPanel.scss';
import { UPSA_PROJECT, PERSONAL_PROJECT } from './constants';

const messages = defineMessages({
  members: {
    id: 'ProjectPanel.members',
    defaultMessage: 'Members',
  },
  settings: {
    id: 'ProjectPanel.settings',
    defaultMessage: 'Settings',
  },
  assign: {
    id: 'ProjectPanel.assign',
    defaultMessage: 'Assign',
  },
  unassign: {
    id: 'ProjectPanel.unassign',
    defaultMessage: 'Unassign',
  },
  delete: {
    id: 'ProjectPanel.delete',
    defaultMessage: 'Delete',
  },
  launchesQuantity: {
    id: 'ProjectPanel.launchesQuantity',
    defaultMessage: 'Launches',
  },
  membersQuantity: {
    id: 'ProjectPanel.membersQuantity',
    defaultMessage: 'Members',
  },
  linkedTooltip: {
    id: 'ProjectPanel.linkedTooltip',
    defaultMessage: 'Synced with UPSA',
  },
  personalTooltip: {
    id: 'ProjectPanel.personalTooltip',
    defaultMessage: 'Personal project',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@connect((state, ownProps) => ({
  isAssigned: !!assignedProjectsSelector(state)[ownProps.project.projectName],
}))
@track()
export class ProjectPanel extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    isAssigned: PropTypes.bool.isRequired,
    onMembersClick: PropTypes.func,
    onSettingsClick: PropTypes.func,
    onUnassign: PropTypes.func,
    onAssign: PropTypes.func,
    onDelete: PropTypes.func,
    nameEventInfo: PropTypes.object,
    statisticEventInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    isPersonal: false,
    onMembersClick: () => {},
    onSettingsClick: () => {},
    onUnassign: () => {},
    onAssign: () => {},
    onDelete: () => {},
    nameEventInfo: {},
    statisticEventInfo: {},
  };

  getMenuItems() {
    const {
      intl,
      onMembersClick,
      onSettingsClick,
      onAssign,
      onUnassign,
      onDelete,
      project,
      isAssigned,
    } = this.props;
    return [
      {
        onClick: () => onMembersClick(project),
        label: intl.formatMessage(messages.members),
        value: 'action-members',
      },
      {
        onClick: () => onSettingsClick(project),
        label: intl.formatMessage(messages.settings),
        value: 'action-settings',
      },
      {
        type: SEPARATOR_ITEM,
      },
      {
        onClick: () => onUnassign(project),
        label: intl.formatMessage(messages.unassign),
        value: 'action-unassign',
        hidden: !isAssigned || project.entryType === PERSONAL_PROJECT,
      },
      {
        onClick: () => onAssign(project),
        label: intl.formatMessage(messages.assign),
        value: 'action-assign',
        hidden: isAssigned,
      },
      {
        onClick: () => onDelete(project),
        label: intl.formatMessage(messages.delete),
        value: 'action-delete',
        type: DANGER_ITEM,
      },
    ];
  }

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
              <DotsMenuButton items={this.getMenuItems()} />
            </span>
          </div>
          <NavLink
            className={cx('name')}
            to={{
              type: PROJECT_PAGE,
              payload: { projectId: projectName },
            }}
            onClick={() => this.props.tracking.trackEvent(this.props.nameEventInfo)}
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
              value={usersQuantity}
            />
            <StatisticsItem
              caption={intl.formatMessage(messages.membersQuantity)}
              value={launchesQuantity}
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
