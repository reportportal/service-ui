import { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { URLS } from 'common/urls';
import { ADMINISTRATOR } from 'common/constants/projectRoles';
import { userIdSelector } from 'controllers/user';

import styles from './personalInfo.scss';

const cx = classNames.bind(styles);
const getPhoto = (userId) => URLS.dataUserPhoto(new Date().getTime(), userId);

@connect((state) => ({
  currentUser: userIdSelector(state),
}))
export class PersonalInfo extends PureComponent {
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
          style={{ backgroundImage: `url(${getPhoto(login)})` }}
        />
        <div className={cx('member-info')}>
          <p className={cx('member-name')}>
            {name}
            <span className={cx({ 'member-you': true, hide: currentUser !== login })}>
              <FormattedMessage id={'PersonalInfo.memberYou'} defaultMessage={'You'} />
            </span>
            <span className={cx({ 'member-admin': true, hide: userRole !== ADMINISTRATOR })}>
              <FormattedMessage id={'PersonalInfo.memberAdmin'} defaultMessage={'Admin'} />
            </span>
          </p>
          <p className={cx('member-login')}>{login}</p>
        </div>
      </Fragment>
    );
  }
}
