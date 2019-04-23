import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { userIdSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { fetchAllUsersAction } from 'controllers/administrate/allUsers';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showModalAction } from 'controllers/modal';
import { Image } from 'components/main/image';
import styles from './nameColumn.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  youLabel: { id: 'NameColumn.youLabel', defaultMessage: 'you' },
  adminLabel: { id: 'NameColumn.adminLabel', defaultMessage: 'admin' },
  makeAdminLabel: { id: 'NameColumn.makeAdminLabel', defaultMessage: 'make admin' },
  changeAccountRoleNotification: {
    id: 'NameColumn.changeAccountRoleNotification',
    defaultMessage: "User role for '{name}' was changed.",
  },
});

@connect(
  (state) => ({
    currentUser: userIdSelector(state),
  }),
  {
    showModal: showModalAction,
    fetchAllUsers: fetchAllUsersAction,
    showNotification,
  },
)
@injectIntl
export class NameColumn extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    currentUser: PropTypes.string,
    intl: intlShape.isRequired,
    showModal: PropTypes.func,
    fetchAllUsers: PropTypes.func,
    showNotification: PropTypes.func.isRequired,
  };
  static defaultProps = {
    value: {},
    currentUser: '',
    showModal: () => {},
    fetchAllUsers: () => {},
  };

  onChangeAccountRole = () => {
    const { intl, showModal, value, fetchAllUsers } = this.props;
    const onSubmit = () => {
      fetch(URLS.userInfo(value.userId), {
        method: 'PUT',
        data: {
          role: value.userRole === ADMINISTRATOR ? USER : ADMINISTRATOR,
        },
      }).then(() => {
        fetchAllUsers();
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: intl.formatMessage(messages.changeAccountRoleNotification, {
            name: value.fullName,
          }),
        });
      });
    };

    showModal({
      id: 'allUsersChangeProjectRoleModal',
      data: {
        name: value.fullName,
        onSubmit,
      },
    });
  };

  render() {
    const { value, className, currentUser, intl } = this.props;
    return (
      <div className={cx('name-col', className)}>
        {value.photoLoaded && (
          <div className={cx('avatar-wrapper')}>
            <Image className={cx('avatar')} src={URLS.dataUserPhoto(value.userId)} alt="avatar" />
          </div>
        )}
        <span className={cx('name')}>{value.fullName}</span>
        {value.userId === currentUser && (
          <span className={cx('label', 'you-label')}>{intl.formatMessage(messages.youLabel)}</span>
        )}
        {value.userRole === ADMINISTRATOR ? (
          <span
            className={cx('label', 'admin-label')}
            onClick={value.userId !== currentUser ? this.onChangeAccountRole : undefined}
          >
            {intl.formatMessage(messages.adminLabel)}
          </span>
        ) : (
          <span className={cx('label', 'make-admin-label')} onClick={this.onChangeAccountRole}>
            {intl.formatMessage(messages.makeAdminLabel)}
          </span>
        )}
      </div>
    );
  }
}
