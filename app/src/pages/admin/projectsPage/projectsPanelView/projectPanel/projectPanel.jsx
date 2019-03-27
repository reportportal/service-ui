import React, { Component } from 'react';
import track from 'react-tracking';
import { injectIntl, intlShape, defineMessages, FormattedRelative } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import { PROJECT_PAGE, PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { Icon } from 'components/main/icon/icon';
import { ProjectMenu } from '../../projectMenu';
import { StatisticsItem } from './statisticsItem';
import { ProjectTooltipIcon } from './projectTooltipIcon';
import styles from './projectPanel.scss';
import { UPSA_PROJECT, PERSONAL_PROJECT } from './constants';

const messages = defineMessages({
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
@track()
export class ProjectPanel extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
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
