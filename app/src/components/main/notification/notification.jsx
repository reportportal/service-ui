import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { state } from 'cerebral/tags';
import { connectToState } from 'common/utils';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const Notification = ({ message, type }) => {
  function getNotification() {
    if (message === '') {
      return null;
    }
    const level = type || 'info';
    return (
      <div className={cx('message-container', level)}>
        <p>{message}</p>
      </div>
    );
  }
  return (
    <div className={cx('notification-container')}>
      {getNotification(message, type)}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['', 'error', 'info', 'success']),
};
Notification.defaultProps = {
  message: '',
  type: '',
}

export default connectToState({
  message: state`app.notification.currentMessage`,
  type: state`app.notification.currentType`,
}, Notification);
