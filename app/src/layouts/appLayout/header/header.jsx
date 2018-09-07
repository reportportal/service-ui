import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import {
  userInfoSelector,
  activeProjectSelector,
  assignedProjectsSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { canSeeMembers } from 'common/utils/permissions';
import { PROJECT_MEMBERS_PAGE, PROJECT_SETTINGS_TAB_PAGE } from 'controllers/pages/constants';
import { GENERAL } from 'common/constants/settingTabs';
import { connect } from 'react-redux';
import { ProjectSelector } from './projectSelector';
import { UserBlock } from './userBlock';
import styles from './header.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  user: userInfoSelector(state),
  activeProject: activeProjectSelector(state),
  assignedProjects: assignedProjectsSelector(state),
  accountRole: userAccountRoleSelector(state),
  userRole: activeProjectRoleSelector(state),
}))
export class Header extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    user: PropTypes.object,
    assignedProjects: PropTypes.object,
    sideMenuOpened: PropTypes.bool,
    toggleSideMenu: PropTypes.func,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
  };

  static defaultProps = {
    user: {},
    assignedProjects: {},
    sideMenuOpened: false,
    toggleSideMenu: () => {},
  };

  render() {
    const {
      sideMenuOpened,
      user,
      toggleSideMenu,
      activeProject,
      assignedProjects,
      accountRole,
      userRole,
    } = this.props;
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
          {canSeeMembers(accountRole, userRole) && (
            <NavLink
              to={{ type: PROJECT_MEMBERS_PAGE, payload: { projectId: activeProject } }}
              className={cx('nav-btn', 'members-btn')}
              activeClassName={cx('active')}
            />
          )}
          <NavLink
            to={{
              type: PROJECT_SETTINGS_TAB_PAGE,
              payload: { projectId: activeProject, settingTab: GENERAL },
            }}
            className={cx('nav-btn', 'settings-btn')}
            activeClassName={cx('active')}
          />
        </div>
        <UserBlock user={user} />
      </div>
    );
  }
}
