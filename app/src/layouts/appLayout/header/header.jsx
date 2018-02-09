import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { userSelector } from 'controllers/auth';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import styles from './header.scss';
import { ProjectSelector } from './projectSelector';

const cx = classNames.bind(styles);

@withRouter
@connect(state => ({
  user: userSelector(state),
}))
export class Header extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      query: PropTypes.object,
      search: PropTypes.string,
    }).isRequired,
    user: PropTypes.object,
    history: PropTypes.object,
    isSideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
  };
  static defaultProps = {
    user: {},
    history: {},
    isSideMenuOpened: false,
    toggleSideMenu: () => {},
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
    if (!this.userBlock.contains(e.target) && this.state.menuOpened) {
      this.setState({ menuOpened: false });
    }
  };
  toggleMenu = () => {
    this.setState({ menuOpened: !this.state.menuOpened });
  };

  render() {
    const activeProject = this.props.location.pathname.split('/')[1];
    const activePage = this.props.location.pathname.split('/')[2];
    return (
      <div className={cx('header')}>
        <div className={cx('mobile-header-block')}>
          <div
            className={cx({ hamburger: true, opened: this.props.isSideMenuOpened })}
            onClick={this.props.toggleSideMenu}
          >
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
          </div>
          <div className={cx('rp-logo')} />
        </div>
        <div className={cx('projects-block')}>
          <ProjectSelector
            projects={Object.keys(this.props.user.assigned_projects).sort()}
            activeProject={activeProject}
          />
        </div>
        <div className={cx('separator')} />
        <div className={cx('nav-btns-block')}>
          <div className={cx({ 'nav-btn': true, 'members-btn': true, active: activePage === 'members' })}>
            <Link to={`/${activeProject}/members`} />
          </div>
          <div className={cx({ 'nav-btn': true, 'settings-btn': true, active: activePage === 'settings' })}>
            <Link to={`/${activeProject}/settings`} />
          </div>
        </div>
        <div ref={(userBlock) => { this.userBlock = userBlock; }} className={cx('user-block')} onClick={this.toggleMenu}>
          <div className={cx('user-wrapper')}>
            {(this.props.user.userRole === 'ADMINISTRATOR') ? <div className={cx('admin-beige')}>
              <FormattedMessage id={'header.adminBeige'} defaultMessage={'admin'} />
            </div> : null}
            <div className={cx('username')}>
              { this.props.user.userId }
            </div>
          </div>
          <div className={cx('avatar-wrapper')}>
            <img className={cx('avatar')} src={Utils.authorizeImagePath(`api/v1/data/photo?${this.props.user.userId}?at=${Date.now()}`)} alt="avatar" />
          </div>
          <div className={cx({ 'menu-icon': true, flipped: this.state.menuOpened })} />
          <div className={cx({ menu: true, opened: this.state.menuOpened })}>
            <Link className={cx({ 'menu-item': true, active: this.props.location.pathname.split('/')[1] === 'api' })} to="/api">Api</Link>
            <Link className={cx('menu-item')} to="/administrate">Administrate</Link>
            <Link className={cx({ 'menu-item': true, active: this.props.location.pathname.split('/')[1] === 'user-profile' })} to="/user-profile">Profile</Link>
            <Link className={cx('menu-item')} to="/login">Logout</Link>
          </div>
        </div>
      </div>
    );
  }
}
