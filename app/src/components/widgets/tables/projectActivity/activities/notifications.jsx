import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { NOTIFICATIONS } from 'common/constants/settingsTabs';
import {
  UPDATE_NOTIFICATIONS,
  SWITCH_ON_NOTIFICATIONS,
  SWITCH_OFF_NOTIFICATIONS,
} from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  notifications: {
    id: 'Notifications.notifications',
    defaultMessage: 'E-mail notifications',
  },
  [UPDATE_NOTIFICATIONS]: {
    id: 'Notifications.updateEmail',
    defaultMessage: 'updated',
  },
  [SWITCH_ON_NOTIFICATIONS]: {
    id: 'Notifications.onEmail',
    defaultMessage: 'configured',
  },
  [SWITCH_OFF_NOTIFICATIONS]: {
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
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        <Link
          to={getProjectSettingTabPageLink(activity.projectName, NOTIFICATIONS)}
          className={cx('link')}
          target="_blank"
        >
          {intl.formatMessage(messages.notifications)}.
        </Link>
      </Fragment>
    );
  }
}
