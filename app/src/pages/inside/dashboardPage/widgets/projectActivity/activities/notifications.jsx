import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { NOTIFICATIONS } from 'common/constants/settingTabs';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  notifications: {
    id: 'Notifications.notifications',
    defaultMessage: 'E-mail notifications',
  },
  update_email: {
    id: 'Notifications.updateEmail',
    defaultMessage: 'updated',
  },
  on_email: {
    id: 'Notifications.onEmail',
    defaultMessage: 'configured',
  },
  off_email: {
    id: 'Notifications.offEmail',
    defaultMessage: 'switched off',
  },
});

@injectIntl
export class Notifications extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        <a
          className={cx('link')}
          target="_blank"
          href={`#${activity.projectRef}/settings/${NOTIFICATIONS}`}
        >
          {intl.formatMessage(messages.notifications)}.
        </a>
      </Fragment>
    );
  }
}
