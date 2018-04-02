import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { addTokenToImagePath } from 'common/utils';
import { FormattedMessage } from 'react-intl';
import { userInfoSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link'
import PropTypes from 'prop-types';
import styles from './userBlock.scss';

const cx = classNames.bind(styles);

@connect(
  state => ({
    user: userInfoSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
export class UserBlock extends PureComponent {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    user: PropTypes.object,
  };
  static defaultProps = {
    user: {},
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
  handleOutsideClick = (e) => {
    if (!this.node.contains(e.target) && this.state.menuOpened) {
      this.setState({ menuOpened: false });
    }
  };
  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
  };

  render() {
    return (
      <div ref={(node) => { this.node = node; }} className={cx('user-block')} onClick={this.toggleMenu}>
        <div className={cx('user-wrapper')}>
          {
            (this.props.user.userRole === 'ADMINISTRATOR')
              ? <div className={cx('admin-badge')}><FormattedMessage id={'UserBlock.adminBadge'} defaultMessage={'admin'} /></div>
              : null
          }
          <div className={cx('username')}>
            { this.props.user.userId }
          </div>
        </div>
        <div className={cx('avatar-wrapper')}>
          <img className={cx('avatar')} src={addTokenToImagePath(`api/v1/data/photo?${this.props.user.userId}&at=${Date.now()}`)} alt="avatar" />
        </div>
        <div className={cx({ 'menu-icon': true, flipped: this.state.menuOpened })} />
        <div className={cx({ menu: true, opened: this.state.menuOpened })}>
          <NavLink to={{type:API_PAGE}} className={cx('menu-item')} activeClassName={cx('active')}>
            API
          </NavLink>
          <NavLink to={{type:ADMINISTRATE_PAGE}} className={cx('menu-item')} activeClassName={cx('active')}>
            <FormattedMessage id={'UserBlock.administrate'} defaultMessage={'Administrate'} />
          </NavLink>
          <NavLink to={{type:USER_PROFILE_PAGE}} className={cx('menu-item')} activeClassName={cx('active')}>
            <FormattedMessage id={'UserBlock.profile'} defaultMessage={'Profile'} />
          </NavLink>
          <div className={cx('menu-item')} onClick={this.props.logout}>
            <FormattedMessage id={'UserBlock.logout'} defaultMessage={'Logout'} />
          </div>
        </div>
      </div>
    );
  }
}

