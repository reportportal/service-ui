import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { userIdSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import styles from './nameColumn.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  youLabel: { id: 'NameColumn.youLabel', defaultMessage: 'you' },
  adminLabel: { id: 'NameColumn.adminLabel', defaultMessage: 'admin' },
  makeAdminLabel: { id: 'NameColumn.makeAdminLabel', defaultMessage: 'make admin' },
});

@connect((state) => ({
  currentUser: userIdSelector(state),
}))
@injectIntl
export class NameColumn extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    currentUser: PropTypes.string,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    value: {},
    currentUser: '',
  };
  render() {
    const { value, className, currentUser, intl } = this.props;
    return (
      <div className={cx('name-col', className)}>
        {value.photoLoaded && (
          <div className={cx('avatar-wrapper')}>
            <img className={cx('avatar')} src={URLS.dataUserPhoto(value.userId)} alt="avatar" />
          </div>
        )}
        <span className={cx('name')}>{value.fullName}</span>
        {value.userId === currentUser && (
          <span className={cx('label', 'you-label')}>{intl.formatMessage(messages.youLabel)}</span>
        )}
        {value.userRole === ADMINISTRATOR ? (
          <span className={cx('label', 'admin-label')}>
            {intl.formatMessage(messages.adminLabel)}
          </span>
        ) : (
          <span className={cx('label', 'make-admin-label')}>
            {intl.formatMessage(messages.makeAdminLabel)}
          </span>
        )}
      </div>
    );
  }
}
