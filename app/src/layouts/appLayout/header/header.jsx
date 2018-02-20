import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink, withRouter } from 'react-router-dom';
import { userInfoSelector } from 'controllers/user';
import { connect } from 'react-redux';
import { ProjectSelector } from './projectSelector';
import { UserBlock } from './userBlock';
import styles from './header.scss';

const cx = classNames.bind(styles);

@withRouter
@connect(state => ({
  user: userInfoSelector(state),
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
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
  };
  static defaultProps = {
    user: {},
    history: {},
    sideMenuOpened: false,
    toggleSideMenu: () => {},
  };

  render() {
    const { location, sideMenuOpened, user, toggleSideMenu } = this.props;
    const activeProject = location.pathname.split('/')[1];

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
        <UserBlock />
      </div>
    );
  }
}
