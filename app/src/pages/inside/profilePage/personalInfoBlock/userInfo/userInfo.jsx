import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { userInfoSelector, fetchUserAction } from 'controllers/user';
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
    name: userInfoSelector(state).full_name,
    email: userInfoSelector(state).email,
  }),
  { showNotification, showModalAction, fetchUserAction },
)
@injectIntl
export class UserInfo extends Component {
  static propTypes = {
    userId: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    accountType: PropTypes.string,
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    fetchUserAction: PropTypes.func,
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
      data: { full_name: data.name, email: data.email },
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
        <div className={cx('name')}>
          {name}
          {accountType === INTERNAL && (
            <span className={cx('pencil-icon')} onClick={this.onEdit}>
              {Parser(PencilIcon)}
            </span>
          )}
        </div>
        <div className={cx('email')}>
          {email}
          {accountType === INTERNAL && (
            <div className={cx('pencil-icon')} onClick={this.onEdit}>
              {Parser(PencilIcon)}
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}
