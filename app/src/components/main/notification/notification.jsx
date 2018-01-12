import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { state } from 'cerebral/tags';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
      <div key={message}>
        <div className={cx('message-container', level)}>
          <p>{message}</p>
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
  type: PropTypes.oneOf(['', 'error', 'info', 'success']),
};
Notification.defaultProps = {
  message: '',
  type: '',
};

export default connectToState({
  message: state`app.notification.currentMessage`,
  type: state`app.notification.currentType`,
}, Notification);
