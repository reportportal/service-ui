import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  keepLogs: {
    id: 'DefaultProjectSettings.keepLogs',
    defaultMessage: 'Keep logs',
  },
  keepScreenshots: {
    id: 'DefaultProjectSettings.keepAttachments',
    defaultMessage: 'Keep attachments',
  },
  launchInactivity: {
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
        const oldValue = activity.history[key].oldValue;
        const to = Parser(this.props.intl.formatMessage(messages.to));
        const newValue = activity.history[key].newValue;
        const end = i < size ? ', ' : '.';
        activities += `${activityName} ${from} ${oldValue} ${to} ${newValue}${end}`;
      }
    });
    return activities;
  };

  render() {
    const { activity } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        <FormattedMessage id="ProjectActivity.updateProject" defaultMessage="updated" />
        <a className={cx('link')} target="_blank" href={`#${activity.projectRef}/settings`}>
          <FormattedMessage
            id="ProjectActivity.projectProps"
            defaultMessage="properties of project:"
          />
        </a>
        <span>{this.getActivityHistory(activity)}</span>
      </Fragment>
    );
  }
}
