import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { AddNewCaseButton } from '../addNewCaseButton';
import styles from './noCasesBlock.scss';

const messages = defineMessages({
  noItemsMessage: {
    id: 'NoCasesBlock.noItemsMessage',
    defaultMessage: 'No Email Notification Rules',
  },
  notificationsInfo: {
    id: 'NoCasesBlock.notificationsInfo',
    defaultMessage: 'After launches finish, system will notify selected people by email.',
  },
});
const cx = classNames.bind(styles);

@injectIntl
export class NoCasesBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    updateNotificationCases: PropTypes.func,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    updateNotificationCases: () => {},
    readOnly: false,
  };

  render() {
    const {
      intl: { formatMessage },
      readOnly,
      updateNotificationCases,
    } = this.props;

    return (
      <div className={cx('no-cases-block')}>
        <h3 className={cx('no-items-message')}>{formatMessage(messages.noItemsMessage)}</h3>
        <div className={cx('notifications-info')}>{formatMessage(messages.notificationsInfo)}</div>
        {!readOnly && <AddNewCaseButton updateNotificationCases={updateNotificationCases} />}
      </div>
    );
  }
}
