import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './adminLayout.scss';

const cx = classNames.bind(styles);

const AppLayout = ({ children }) => (
  <div className={cx('admin-container')}>
    <div className={cx('sidebar-container')}>
      <h1>Admin Sidebar</h1>
    </div>
    <div className={cx('content')}>
      <div className={cx('header-container')} >
        <h1>Admin Header</h1>
      </div>
      <div className={cx('page-container')}>
        {children}
      </div>
    </div>
  </div>
);

AppLayout.propTypes = {
  children: PropTypes.node,
};

AppLayout.defaultProps = {
  children: null,
};

export default AppLayout;
