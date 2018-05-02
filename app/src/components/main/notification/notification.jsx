import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
// import { TransitionGroup } from 'react-transition-group';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  successLogin: { id: 'Notification.successLogin', defaultMessage: 'Signed in successfully' },
  infoLogout: { id: 'Notification.infoLogout', defaultMessage: 'You have been logged out' },
});

@injectIntl
export class Notification extends PureComponent {
  static propTypes = {
    message: PropTypes.string,
    messageId: PropTypes.string,
    type: PropTypes.oneOf(['', 'error', 'info', 'success']),
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    message: '',
    messageId: '',
    type: '',
  };
  render() {
    const { message, type, messageId, intl } = this.props;
    function getNotification() {
      if (message === '' && messageId === '') {
        return null;
      }
      const level = type || 'info';
      return (
        <div key={message}>
          <div className={cx('message-container', level)}>
            <p>{ messageId ? intl.formatMessage(messages[messageId]) : message}</p>
          </div>
        </div>
      );
    }
    return (
      <div className={cx('notification-container')}>
        {/* <TransitionGroup> */}
        {getNotification(message, type)}
        {/* </TransitionGroup> */}
      </div>
    );
  }
}
