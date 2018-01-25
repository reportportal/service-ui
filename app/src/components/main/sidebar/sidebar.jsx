import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

const SidebarItem = ({ link, name }) => (
  <NavLink to={link} className={cx('item')} activeClassName={cx('active')}>{name}</NavLink>
);
SidebarItem.propTypes = {
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const Sidebar = () => (
  <div className={cx('sidebar')}>
    <SidebarItem link="/default_project/dashboard" name="Dashboards" />
    <SidebarItem link="/default_project/launches" name="Launches" />
    <SidebarItem link="/default_project/filters" name="Filters" />
    <SidebarItem link="/default_project/userdebug" name="Debug" />
  </div>
  );

export default Sidebar;
