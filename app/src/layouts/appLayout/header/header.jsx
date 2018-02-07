import React from 'react';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './header.scss';
import { ProjectSelector } from './projectSelector';

const cx = classNames.bind(styles);

export const Header = () => (
  <div className={cx('header')}>
    <Link to="/default_project/members">Members</Link>
    <Link to="/default_project/settings">Settings</Link>
    <Link to="/api">Api</Link>
    <Link to="/administrate">Administrate</Link>
    <Link to="/user-profile">Profile</Link>
    <Link to="/login">Logout</Link>
    <ProjectSelector projects={['Default_active', 'Default_active_2']} activeProject="Default_active" />
  </div>
);
