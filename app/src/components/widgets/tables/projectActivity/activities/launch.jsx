import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { PROJECT_LAUNCHES_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';
import {
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  START_IMPORT,
  FINISH_IMPORT,
} from 'common/constants/actionTypes';
import { getTestItemPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [START_LAUNCH]: {
    id: 'LaunchChanges.start',
    defaultMessage: 'started',
  },
  [FINISH_LAUNCH]: {
    id: 'LaunchChanges.finish',
    defaultMessage: 'finished',
  },
  [DELETE_LAUNCH]: {
    id: 'LaunchChanges.delete',
    defaultMessage: 'deleted',
  },
  [START_IMPORT]: {
    id: 'LaunchChanges.startImport',
    defaultMessage: 'started import',
  },
  [FINISH_IMPORT]: {
    id: 'LaunchChanges.finishImport',
    defaultMessage: 'finished import',
  },
  launch: {
    id: 'LaunchChanges.launch',
    defaultMessage: 'launch',
  },
});

@injectIntl
export class Launch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  getLaunchesPageLink = (projectId) => ({
    type: PROJECT_LAUNCHES_PAGE,
    payload: {
      projectId,
      filterId: ALL,
    },
  });

  render() {
    const {
      activity,
      intl: { formatMessage },
    } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {`${messages[activity.actionType] && formatMessage(messages[activity.actionType])}`}
        {activity.actionType === DELETE_LAUNCH && (
          <Fragment>
            {` ${formatMessage(messages.launch)} `}
            {activity.details.objectName}.
          </Fragment>
        )}
        {(activity.actionType === START_LAUNCH || activity.actionType === FINISH_LAUNCH) && (
          <Fragment>
            {` ${formatMessage(messages.launch)}`}
            <Link
              to={getTestItemPageLink(activity.projectName, activity.loggedObjectId)}
              className={cx('link')}
              target="_blank"
            >
              {activity.details.objectName}.
            </Link>
          </Fragment>
        )}
        {(activity.actionType === START_IMPORT || activity.actionType === FINISH_IMPORT) && (
          <Link
            to={this.getLaunchesPageLink(activity.projectName)}
            className={cx('link')}
            target="_blank"
          >
            {activity.details.objectName}.
          </Link>
        )}
      </Fragment>
    );
  }
}
