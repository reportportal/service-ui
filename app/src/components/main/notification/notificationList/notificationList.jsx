import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { hideNotification } from 'controllers/notification';
import { NotificationItem } from './notificationListItem';
import styles from './notificationList.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    notifications: state.notifications,
  }),
  {
    hideNotification,
  },
)
export class NotificationList extends PureComponent {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideNotification: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className={cx('notification-list')}>
        <TransitionGroup>
          {this.props.notifications.map((m) => (
            <CSSTransition key={m.uid} timeout={500} classNames="notification-transition">
              <NotificationItem {...m} onMessageClick={this.props.hideNotification} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    );
  }
}
