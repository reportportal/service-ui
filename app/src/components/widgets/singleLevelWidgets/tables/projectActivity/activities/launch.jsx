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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
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
  MARK_LAUNCH_AS_IMPORTANT,
  UNMARK_LAUNCH_AS_IMPORTANT,
} from 'common/constants/actionTypes';
import { getTestItemPageLink } from './utils';
import styles from './common.scss';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';

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
  [MARK_LAUNCH_AS_IMPORTANT]: {
    id: 'LaunchChanges.markLaunchAsImportant',
    defaultMessage: ' is marked as important by ',
  },
  [UNMARK_LAUNCH_AS_IMPORTANT]: {
    id: 'LaunchChanges.unmarkLaunchAsImportant',
    defaultMessage: ' is unmarked as important by ',
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
    intl: PropTypes.object.isRequired,
    ...activityItemPropTypes,
  };
  static defaultProps = activityItemDefaultProps;

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

    const isRetentionType =
      activity.actionType === MARK_LAUNCH_AS_IMPORTANT ||
      activity.actionType === UNMARK_LAUNCH_AS_IMPORTANT;

    return (
      <Fragment>
        {!isRetentionType && (
          <Fragment>
            <span className={cx('user-name')}>{activity.user}</span>
            `${messages[activity.actionType] && formatMessage(messages[activity.actionType])}`
          </Fragment>
        )}
        {activity.actionType === DELETE_LAUNCH && (
          <Fragment>
            {` ${formatMessage(messages.launch)} `}
            {activity.objectName}.
          </Fragment>
        )}
        {isRetentionType && (
          <Fragment>
            <span className={cx('activity-name')}>{activity.objectName}</span>
            {formatMessage(messages[activity.actionType])}
            <span className={cx('user-name')}>{activity.user}</span>
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
              {activity.objectName}.
            </Link>
          </Fragment>
        )}
        {(activity.actionType === START_IMPORT || activity.actionType === FINISH_IMPORT) && (
          <Link
            to={this.getLaunchesPageLink(activity.projectName)}
            className={cx('link')}
            target="_blank"
          >
            {activity.objectName}.
          </Link>
        )}
      </Fragment>
    );
  }
}
