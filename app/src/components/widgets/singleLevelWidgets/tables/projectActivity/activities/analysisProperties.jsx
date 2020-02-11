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
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import { ANALYSIS } from 'common/constants/settingsTabs';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  'analyzer.isAutoAnalyzerEnabled': {
    id: 'UpdateAnalysisSettings.autoAnalyze',
    defaultMessage: 'switch Auto Analysis',
  },
  'analyzer.numberOfLogLines': {
    id: 'UpdateAnalysisSettings.numberOfLogLines',
    defaultMessage: 'Number of log lines',
  },
  'analyzer.minDocFreq': {
    id: 'UpdateAnalysisSettings.minDocFreq',
    defaultMessage: 'Minimum document frequency',
  },
  'analyzer.minShouldMatch': {
    id: 'UpdateAnalysisSettings.minShouldMatch',
    defaultMessage: 'Minimum should match',
  },
  'analyzer.minTermFreq': {
    id: 'UpdateAnalysisSettings.minTermFreq',
    defaultMessage: 'Minimum term frequency',
  },
  'analyzer.autoAnalyzerMode': {
    id: 'UpdateAnalysisSettings.analyzeMode',
    defaultMessage: 'Base for Auto Analysis',
  },
  from: {
    id: 'AnalysisProperties.from',
    defaultMessage: 'from',
  },
  to: {
    id: 'AnalysisProperties.to',
    defaultMessage: 'to',
  },
  all: {
    id: 'AnalysisProperties.all',
    defaultMessage: 'All',
  },
  on: {
    id: 'AnalysisProperties.on',
    defaultMessage: 'ON',
  },
  off: {
    id: 'AnalysisProperties.off',
    defaultMessage: 'OFF',
  },
});

@injectIntl
export class AnalysisProperties extends Component {
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
        const oldValue = this.valueReplacer(item.oldValue) || item.oldValue;
        const newValue = this.valueReplacer(item.newValue) || item.newValue;

        activities.push(`${activityName} ${from} ${oldValue} ${to} ${newValue}`);
      }
    });

    return `${activities.join(', ')}.`;
  };

  valueReplacer = (value) => {
    switch (value.toString()) {
      case '-1':
        return this.props.intl.formatMessage(messages.all);
      case 'true':
        return this.props.intl.formatMessage(messages.on);
      case 'false':
        return this.props.intl.formatMessage(messages.off);
      default:
        return null;
    }
  };

  render() {
    const { activity } = this.props;

    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        <FormattedMessage id="UpdateAnalysisSettings.updated" defaultMessage="updated" />
        <Link
          className={cx('link')}
          target="_blank"
          to={getProjectSettingTabPageLink(activity.projectName, ANALYSIS)}
        >
          <FormattedMessage
            id="UpdateAnalysisSettings.analysisProps"
            defaultMessage="Auto-Analysis properties:"
          />
        </Link>
        <span>{this.getActivityHistory(activity)}</span>
      </Fragment>
    );
  }
}
