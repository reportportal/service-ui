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

import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import DefaultUserImage from 'common/img/default-user-avatar.png';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { URLS } from 'common/urls';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import { userInfoSelector, photoTimeStampSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { API_PAGE, ADMINISTRATE_PAGE, USER_PROFILE_PAGE } from 'controllers/pages/constants';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { NavLink } from 'components/main/navLink';
import { Image } from 'components/main/image';
import styles from './userBlock.scss';

const cx = classNames.bind(styles);

const UserAvatar = ({ photoTimeStamp }) => (
  <div className={cx('avatar-wrapper')}>
    <Image
      className={cx('avatar')}
      src={URLS.dataPhoto(photoTimeStamp, true)}
      alt="avatar"
      fallback={DefaultUserImage}
    />
  </div>
);
UserAvatar.propTypes = {
  photoTimeStamp: PropTypes.number,
};
UserAvatar.defaultProps = {
  photoTimeStamp: null,
};

const UserAvatarWithTooltip = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    dark: true,
  },
})(UserAvatar);

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
export class UserBlock extends Component {
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

  controlNode = React.createRef();

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
    this.props.tracking.trackEvent(SIDEBAR_EVENTS.CLICK_LOGOUT_LINK);
  };

  handleOutsideClick = (e) => {
    if (
      this.controlNode &&
      this.controlNode.current &&
      !this.controlNode.current.contains(e.target) &&
      this.state.menuOpened
    ) {
      this.setState({ menuOpened: false });
    }
  };

  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
    !this.state.menuOpened && this.props.tracking.trackEvent(SIDEBAR_EVENTS.CLICK_PROFILE_DROPDOWN);
  };

  render() {
    const userDetails = (
      <>
        {this.props.user.userRole === ADMINISTRATOR && (
          <div className={cx('admin-badge')}>
            <FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} />
          </div>
        )}
        <div className={cx('username')}>{this.props.user.userId}</div>
      </>
    );

    return (
      <div className={cx('user-block')} ref={this.controlNode} onClick={this.toggleMenu}>
        <UserAvatarWithTooltip
          photoTimeStamp={this.props.photoTimeStamp}
          className={cx('user-tooltip')}
          tooltipContent={userDetails}
          showTooltip={!this.state.menuOpened}
          preventParsing
        />
        {this.state.menuOpened && (
          <div className={cx('menu')}>
            <div className={cx('user-wrapper')}>
              <UserAvatar photoTimeStamp={this.props.photoTimeStamp} />
              <div className={cx('details')}>{userDetails}</div>
            </div>
            <NavLink
              to={{ type: USER_PROFILE_PAGE }}
              className={cx('menu-item')}
              activeClassName={cx('active')}
              onClick={() => this.props.tracking.trackEvent(SIDEBAR_EVENTS.CLICK_PROFILE_LINK)}
            >
              <FormattedMessage id={'UserBlock.profile'} defaultMessage={'Profile'} />
            </NavLink>
            {this.props.user.userRole === ADMINISTRATOR && (
              <NavLink
                to={{ type: ADMINISTRATE_PAGE }}
                className={cx('menu-item')}
                activeClassName={cx('active')}
                onClick={() => this.onClickLink(SIDEBAR_EVENTS.CLICK_ADMINISTRATE_LINK)}
              >
                <FormattedMessage id={'UserBlock.administrate'} defaultMessage={'Administrate'} />
              </NavLink>
            )}
            <NavLink
              to={{ type: API_PAGE }}
              className={cx('menu-item')}
              activeClassName={cx('active')}
              onClick={() => this.onClickLink(SIDEBAR_EVENTS.CLICK_API_LINK)}
            >
              API
            </NavLink>
            <div className={cx('menu-item')} onClick={this.onClickLogout}>
              <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Logout'} />
            </div>
            <div className={cx('menu-arrow')} />
          </div>
        )}
      </div>
    );
  }
}
