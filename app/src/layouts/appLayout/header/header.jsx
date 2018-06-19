import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import {
  userInfoSelector,
  activeProjectSelector,
  assignedProjectsSelector,
} from 'controllers/user';
import { PROJECT_MEMBERS_PAGE, PROJECT_SETTINGS_PAGE } from 'controllers/pages/constants';
import { connect } from 'react-redux';
import { ProjectSelector } from './projectSelector';
import { UserBlock } from './userBlock';
import styles from './header.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  user: userInfoSelector(state),
  activeProject: activeProjectSelector(state),
  assignedProjects: assignedProjectsSelector(state),
}))
export class Header extends PureComponent {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    user: PropTypes.object,
    assignedProjects: PropTypes.object,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
  };

  static defaultProps = {
    user: {},
    assignedProjects: {},
    sideMenuOpened: false,
    toggleSideMenu: () => {},
  };

  render() {
    const { sideMenuOpened, user, toggleSideMenu, activeProject, assignedProjects } = this.props;
    return (
      <div className={cx('header')}>
        <div className={cx('mobile-header-block')}>
          <div className={cx({ hamburger: true, opened: sideMenuOpened })} onClick={toggleSideMenu}>
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
            <div className={cx('hamburger-part')} />
          </div>
          <div className={cx('rp-logo')} />
        </div>
        <div className={cx('projects-block')}>
          <ProjectSelector
            projects={Object.keys(assignedProjects).sort()}
            activeProject={activeProject}
          />
        </div>
        <div className={cx('separator')} />
        <div className={cx('nav-btns-block')}>
          <NavLink
            to={{ type: PROJECT_MEMBERS_PAGE, payload: { projectId: activeProject } }}
            className={cx('nav-btn', 'members-btn')}
            activeClassName={cx('active')}
          />
          <NavLink
            to={{ type: PROJECT_SETTINGS_PAGE, payload: { projectId: activeProject } }}
            className={cx('nav-btn', 'settings-btn')}
            activeClassName={cx('active')}
          />
        </div>
        <UserBlock user={user} />
      </div>
    );
  }
}
