/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
