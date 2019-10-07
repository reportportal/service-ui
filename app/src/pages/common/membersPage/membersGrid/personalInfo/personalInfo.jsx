import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { userIdSelector } from 'controllers/user';
import { projectIdSelector } from 'controllers/pages';
import { UserAvatar } from 'pages/inside/common/userAvatar';
import styles from './personalInfo.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  currentUser: userIdSelector(state),
  projectId: projectIdSelector(state),
}))
export class PersonalInfo extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    name: PropTypes.string,
    login: PropTypes.string,
    userRole: PropTypes.string,
    currentUser: PropTypes.string,
  };
  static defaultProps = {
    name: '',
    login: '',
    userRole: '',
    currentUser: '',
  };

  render() {
    const { projectId, name, login, userRole, currentUser } = this.props;
    return (
      <div className={cx('personal-info')}>
        <UserAvatar className={cx('avatar-wrapper')} projectId={projectId} userId={login} />
        <div className={cx('member-info')}>
          <p className={cx('member-name-wrap')}>
            <span className={cx('member-name')} title={name}>
              {name}
            </span>
            {currentUser === login && (
              <span className={cx('member-you')}>
                <FormattedMessage id={'PersonalInfo.memberYou'} defaultMessage={'You'} />
              </span>
            )}
            {userRole === ADMINISTRATOR && (
              <span className={cx('member-admin')}>
                <FormattedMessage id={'PersonalInfo.memberAdmin'} defaultMessage={'Admin'} />
              </span>
            )}
          </p>
          <p className={cx('member-login')} title={login}>
            {login}
          </p>
        </div>
      </div>
    );
  }
}
