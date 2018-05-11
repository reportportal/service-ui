import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { intlShape, defineMessages } from 'react-intl';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  successLogin: { id: 'Notification.successLogin', defaultMessage: 'Signed in successfully' },
  failureLogin: { id: 'Notification.failureLogin', defaultMessage: 'Wrong username or password' },
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
  };
  static defaultProps = {
    message: '',
    messageId: '',
    type: 'info',
  };

  messageClick = () => {
    this.props.onMessageClick(this.props.uid);
  };

  render() {
    const { message, type, messageId, intl } = this.props;
    if (message === '' && messageId === '') {
      return null;
    }
    return (
      <div key={message} onClick={this.messageClick}>
        <div className={cx('message-container', type)}>
          <p> {messageId ? intl.formatMessage(messages[messageId]) : message}</p>
        </div>
      </div>
    );
  }
}
