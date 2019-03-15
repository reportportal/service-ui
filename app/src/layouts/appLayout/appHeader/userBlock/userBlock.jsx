import React, { PureComponent } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { userInfoSelector, photoTimeStampSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { API_PAGE, ADMINISTRATE_PAGE, USER_PROFILE_PAGE } from 'controllers/pages/constants';
import { HEADER_EVENTS } from 'components/main/analytics/events';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { URLS } from 'common/urls';
import styles from './userBlock.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    user: userInfoSelector(state),
    photoTimeStamp: photoTimeStampSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
@track()
export class UserBlock extends PureComponent {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    user: PropTypes.object,
    photoTimeStamp: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    user: {},
    photoTimeStamp: null,
  };
  state = {
    menuOpened: false,
  };
  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick, false);
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, false);
  }

  onClickLink = (eventInfo) => {
    this.props.tracking.trackEvent(eventInfo);
  };

  onClickLogout = () => {
    this.props.logout();
    this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_LOGOUT_LINK);
  };

  handleOutsideClick = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.menuOpened) {
      this.setState({ menuOpened: false });
    }
  };

  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
    !this.state.menuOpened && this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROFILE_DROPDOWN);
  };

  render() {
    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className={cx('user-block')}
        onClick={this.toggleMenu}
      >
        <div className={cx('user-wrapper')}>
          {this.props.user.userRole === ADMINISTRATOR && (
            <div className={cx('admin-badge')}>
              <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
            </div>
          )}
          <div className={cx('username')}>{this.props.user.userId}</div>
        </div>
        <div className={cx('avatar-wrapper')}>
          <img
            className={cx('avatar')}
            src={URLS.dataPhoto(this.props.photoTimeStamp)}
            alt="avatar"
          />
        </div>
        <div className={cx('menu-icon', { flipped: this.state.menuOpened })} />
        <div className={cx('menu', { opened: this.state.menuOpened })}>
          <NavLink
            to={{ type: API_PAGE }}
            className={cx('menu-item')}
            activeClassName={cx('active')}
            onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_API_LINK)}
          >
            API
          </NavLink>
          {this.props.user.userRole === ADMINISTRATOR && (
            <NavLink
              to={{ type: ADMINISTRATE_PAGE }}
              className={cx('menu-item')}
              activeClassName={cx('active')}
              onClick={() => this.onClickLink(HEADER_EVENTS.CLICK_ADMINISTRATE_LINK)}
            >
              <FormattedMessage id={'UserBlock.administrate'} defaultMessage={'Administrate'} />
            </NavLink>
          )}
          <NavLink
            to={{ type: USER_PROFILE_PAGE }}
            className={cx('menu-item')}
            activeClassName={cx('active')}
            onClick={() => this.props.tracking.trackEvent(HEADER_EVENTS.CLICK_PROFILE_LINK)}
          >
            <FormattedMessage id={'UserBlock.profile'} defaultMessage={'Profile'} />
          </NavLink>
          <div className={cx('menu-item')} onClick={this.onClickLogout}>
            <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Logout'} />
          </div>
        </div>
      </div>
    );
  }
}
