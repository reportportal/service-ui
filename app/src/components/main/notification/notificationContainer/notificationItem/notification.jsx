import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, intlShape } from 'react-intl';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  successLogin: { id: 'Notification.successLogin', defaultMessage: 'Signed in successfully' },
  failureDefault: {
    id: 'Notification.failureDefault',
    defaultMessage: 'An error occurred while connecting to server: {error}',
  },
  infoLogout: { id: 'Notification.infoLogout', defaultMessage: 'You have been logged out' },
});

export class Notification extends PureComponent {
  static propTypes = {
    message: PropTypes.string,
    messageId: PropTypes.string,
    uid: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['', 'error', 'info', 'success']),
    onMessageClick: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
  };
  static defaultProps = {
    message: '',
    messageId: '',
    type: NOTIFICATION_TYPES.INFO,
    values: {},
  };

  messageClick = () => {
    this.props.onMessageClick(this.props.uid);
  };

  render() {
    const { message, type, messageId, intl, values } = this.props;
    if (message === '' && messageId === '') {
      return null;
    }
    return (
      <div key={message} onClick={this.messageClick}>
        <div className={cx('message-container', type)}>
          <p> {messageId ? intl.formatMessage(messages[messageId], values) : message}</p>
        </div>
      </div>
    );
  }
}
