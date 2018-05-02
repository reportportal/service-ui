import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Notification } from 'components/main/notification';
import styles from './adminLayout.scss';
import { AdminHeader } from './header';
import { Sidebar } from './sidebar';

const cx = classNames.bind(styles);

export const AdminLayout = ({ children }) => (
  <div className={cx('admin-container')}>
    <div className={cx('sidebar-container')}>
      <Sidebar />
    </div>
    <div className={cx('content')}>
      <div className={cx('header-container')} >
        <AdminHeader />
      </div>
      <div className={cx('page-container')}>
        {children}
      </div>
    </div>
    <Notification />
  </div>
);

AdminLayout.propTypes = {
  children: PropTypes.node,
};

AdminLayout.defaultProps = {
  children: null,
};
