import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { userInfoSelector, activeProjectSelector } from 'controllers/user';
import { connect } from 'react-redux';
import { ProjectSelector } from './projectSelector';
import { UserBlock } from './userBlock';
import styles from './header.scss';

const cx = classNames.bind(styles);

@withRouter
@connect(state => ({
  user: userInfoSelector(state),
  activeProject: activeProjectSelector(state),
}))
export class Header extends PureComponent {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    user: PropTypes.object,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
  };
  static defaultProps = {
    user: {},
    sideMenuOpened: false,
    toggleSideMenu: () => {},
  };

  render() {
    const { sideMenuOpened, user, toggleSideMenu, activeProject } = this.props;
    return (
      <div className={cx('header')}>
        <div className={cx('mobile-header-block')}>
          <div
            className={cx({ hamburger: true, opened: sideMenuOpened })}
            onClick={toggleSideMenu}
          >
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
          </div>
          <div className={cx('rp-logo')} />
        </div>
        <div className={cx('projects-block')}>
          <ProjectSelector
            projects={Object.keys(user.assigned_projects).sort()}
            activeProject={activeProject}
          />
        </div>
        <div className={cx('separator')} />
        <div className={cx('nav-btns-block')}>
          <NavLink to={`/${activeProject}/members`} className={cx('nav-btn', 'members-btn')} activeClassName={cx('active')} />
          <NavLink to={`/${activeProject}/settings`} className={cx('nav-btn', 'settings-btn')} activeClassName={cx('active')} />
        </div>
        <UserBlock user={user} />
      </div>
    );
  }
}
