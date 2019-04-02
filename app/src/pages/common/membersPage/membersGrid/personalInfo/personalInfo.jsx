import { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { URLS } from 'common/urls';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { userIdSelector } from 'controllers/user';

import styles from './personalInfo.scss';

const cx = classNames.bind(styles);
const getPhotoURL = (userId) => URLS.dataUserPhoto(userId);

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
      <Fragment>
        <div
          className={cx('member-avatar')}
          style={{ backgroundImage: `url(${getPhotoURL(login)})` }}
        />
        <div className={cx('member-info')}>
          <p className={cx('member-name')}>
            {name}
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
          <p className={cx('member-login')}>{login}</p>
        </div>
      </Fragment>
    );
  }
}
