import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { URLS } from 'common/urls';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { userIdSelector } from 'controllers/user';
import { Image } from 'components/main/image';

import styles from './personalInfo.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  currentUser: userIdSelector(state),
}))
export class PersonalInfo extends Component {
  static propTypes = {
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
    const { name, login, userRole, currentUser } = this.props;
    return (
      <div className={cx('personal-info')}>
        <div className={cx('avatar-wrapper')}>
          <Image
            className={cx('member-avatar')}
            src={URLS.dataUserPhoto(login)}
            fallback={DefaultUserImage}
          />
        </div>
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
