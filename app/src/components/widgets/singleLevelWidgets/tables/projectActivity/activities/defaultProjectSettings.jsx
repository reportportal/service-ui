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
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { PROJECT_SETTINGS_PAGE } from 'controllers/pages';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  'job.keepLogs': {
    id: 'DefaultProjectSettings.keepLogs',
    defaultMessage: 'Keep logs',
  },
  'job.keepLaunches': {
    id: 'DefaultProjectSettings.keepLaunches',
    defaultMessage: 'Keep launches',
  },
  'job.keepScreenshots': {
    id: 'DefaultProjectSettings.keepAttachments',
    defaultMessage: 'Keep attachments',
  },
  'job.interruptJobTime': {
    id: 'DefaultProjectSettings.launchInactivity',
    defaultMessage: 'Launch inactivity timeout',
  },
  from: {
    id: 'DefaultProjectSettings.from',
    defaultMessage: 'from',
  },
  to: {
    id: 'DefaultProjectSettings.to',
    defaultMessage: 'to',
  },
});

@injectIntl
export class DefaultProjectSettings extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  getActivityHistory = (activity) => {
    const from = this.props.intl.formatMessage(messages.from);
    const to = this.props.intl.formatMessage(messages.to);
    const activities = [];
    activity.details.history.forEach((item) => {
      if (item.newValue && item.oldValue) {
        const activityName = messages[item.field]
          ? this.props.intl.formatMessage(messages[item.field])
          : '';
        const oldValue = item.oldValue;
        const newValue = item.newValue;
        activities.push(`${activityName} ${from} ${oldValue} ${to} ${newValue}`);
      }
    });
    return `${activities.join(', ')}.`;
  };

  getProjectSettingsLink = (projectId) => ({
    type: PROJECT_SETTINGS_PAGE,
    payload: { projectId },
  });

  render() {
    const { activity } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        <FormattedMessage id="ProjectActivity.updateProject" defaultMessage="updated" />
        <Link
          to={this.getProjectSettingsLink(activity.projectName)}
          className={cx('link')}
          target="_blank"
        >
          <FormattedMessage
            id="ProjectActivity.projectProps"
            defaultMessage="properties of project:"
          />
        </Link>
        {this.getActivityHistory(activity)}
      </Fragment>
    );
  }
}
