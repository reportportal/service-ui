import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { ANALYSIS } from 'common/constants/settingsTabs';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  auto_analyze: {
    id: 'UpdateAnalysisSettings.autoAnalyze',
    defaultMessage: 'switch Auto Analysis',
  },
  number_of_log_lines: {
    id: 'UpdateAnalysisSettings.numberOfLogLines',
    defaultMessage: 'Number of log lines',
  },
  min_doc_freq: {
    id: 'UpdateAnalysisSettings.minDocFreq',
    defaultMessage: 'Minimum document frequency',
  },
  min_should_match: {
    id: 'UpdateAnalysisSettings.minShouldMatch',
    defaultMessage: 'Minimum should match',
  },
  min_term_freq: {
    id: 'UpdateAnalysisSettings.minTermFreq',
    defaultMessage: 'Minimum term frequency',
  },
  analyze_mode: {
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
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  getActivityHistory = (activity) => {
    const size = Object.keys(activity.history).length;
    let i = 0;
    let activities = '';
    Object.keys(activity.history).forEach((key) => {
      i += 1;
      if (activity.history[key].newValue && activity.history[key].oldValue) {
        const activityName = Parser(this.props.intl.formatMessage(messages[key]));
        const from = Parser(this.props.intl.formatMessage(messages.from));
        const oldValue =
          this.valueReplacer(activity.history[key].oldValue) || activity.history[key].oldValue;
        const to = Parser(this.props.intl.formatMessage(messages.to));
        const newValue =
          this.valueReplacer(activity.history[key].newValue) || activity.history[key].newValue;
        const end = i < size ? ', ' : '.';
        activities += `${activityName} ${from} ${oldValue} ${to} ${newValue}${end}`;
      }
    });
    return activities;
  };

  valueReplacer = (value) => {
    switch (value.toString()) {
      case '-1':
        return Parser(this.props.intl.formatMessage(messages.all));
      case 'true':
        return Parser(this.props.intl.formatMessage(messages.on));
      case 'false':
        return Parser(this.props.intl.formatMessage(messages.off));
      default:
        return null;
    }
  };

  render() {
    const { activity } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        <FormattedMessage id="UpdateAnalysisSettings.updated" defaultMessage="updated" />
        <a
          className={cx('link')}
          target="_blank"
          href={`#${activity.projectRef}/settings/${ANALYSIS}`}
        >
          <FormattedMessage
            id="UpdateAnalysisSettings.analysisProps"
            defaultMessage="Auto-Analysis properties:"
          />
        </a>
        <span>{this.getActivityHistory(activity)}</span>
      </Fragment>
    );
  }
}
