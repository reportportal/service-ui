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

import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector, fetchUserAction } from 'controllers/user';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { INTERNAL } from 'common/constants/accountType';
import styles from './userInfo.scss';
import PencilIcon from './img/pencil-icon-inline.svg';

const cx = classNames.bind(styles);

const messages = defineMessages({
  submitSuccess: {
    id: 'UserInfo.submitSuccess',
    defaultMessage: 'Changes have been saved successfully',
  },
  submitError: {
    id: 'UserInfo.submitError',
    defaultMessage: "Error! Can't save changes",
  },
});

@connect(
  (state) => ({
    name: userInfoSelector(state).fullName,
    email: userInfoSelector(state).email,
  }),
  { showNotification, showModalAction, fetchUserAction },
)
@injectIntl
@track()
export class UserInfo extends Component {
  static propTypes = {
    userId: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    accountType: PropTypes.string,
    intl: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    fetchUserAction: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    userId: '',
    name: '',
    email: '',
    accountType: '',
    fetchUserAction: () => {},
  };

  onEdit = () => {
    this.props.showModalAction({
      id: 'editPersonalInformationModal',
      data: {
        onEdit: this.editInfoHandler,
        info: {
          name: this.props.name,
          email: this.props.email,
        },
      },
    });
  };
  editInfoHandler = (data) => {
    fetch(URLS.userInfo(this.props.userId), {
      method: 'put',
      data: { fullName: data.name, email: data.email },
    })
      .then(() => {
        this.props.fetchUserAction();
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.submitError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  render() {
    const { userId, accountType, name, email } = this.props;
    return (
      <Fragment>
        <div className={cx('login')}>{userId}</div>
        <div className={cx('name-line')}>
          <span className={cx('name')}>{name}</span>
          {accountType === INTERNAL && (
            <span
              className={cx('pencil-icon')}
              onClick={() => {
                this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.EDIT_USER_NAME_ICON);
                this.onEdit();
              }}
            >
              {Parser(PencilIcon)}
            </span>
          )}
        </div>
        <div className={cx('email-line')}>
          <span className={cx('email')}>{email}</span>
          {accountType === INTERNAL && (
            <div
              className={cx('pencil-icon')}
              onClick={() => {
                this.props.tracking.trackEvent(PROFILE_PAGE_EVENTS.EDIT_EMAIL_ICON);
                this.onEdit();
              }}
            >
              {Parser(PencilIcon)}
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
