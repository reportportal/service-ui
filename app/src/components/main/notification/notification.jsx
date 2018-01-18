import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { state } from 'cerebral/tags';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connectToState } from 'common/utils';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const Notification = ({ message, type, messageId, intl }) => {
  const messages = defineMessages({
    successLogin: { id: 'Notification.successLogin', defaultMessage: 'Signed in successfully' },

    infoLogout: { id: 'Notification.infoLogout', defaultMessage: 'You have been logged out' },
  });
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
      <ReactCSSTransitionGroup
        transitionName="notification-opacity"
        transitionEnterTimeout={200}
        transitionLeaveTimeout={700}
      >
        {getNotification(message, type)}
      </ReactCSSTransitionGroup>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string,
  messageId: PropTypes.string,
  type: PropTypes.oneOf(['', 'error', 'info', 'success']),
  intl: intlShape.isRequired,
};
Notification.defaultProps = {
  message: '',
  messageId: '',
  type: '',
};

export default connectToState({
  message: state`app.notification.currentMessage`,
  messageId: state`app.notification.currentMessageId`,
  type: state`app.notification.currentType`,
}, injectIntl(Notification));
