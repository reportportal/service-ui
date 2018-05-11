import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames/bind';
import { Notification } from './notificationItem';
import styles from './notificationContainer.scss';

const cx = classNames.bind(styles);

export class NotificationContainer extends PureComponent {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideNotification: PropTypes.func.isRequired,
  };

  render() {
    const { notifications, hideNotification } = this.props;

    return (
      <div className={cx('notification-container')}>
        <TransitionGroup>
          {notifications.map((m) => (
            <CSSTransition key={m.uid} timeout={500} classNames="notification-transition">
              <Notification {...m} onMessageClick={hideNotification} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    );
  }
}
