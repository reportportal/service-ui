import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Sidebar from '../../components/main/sidebar/sidebar';
import Header from '../../components/main/header/header';
import styles from './appLayout.scss';

const cx = classNames.bind(styles);

const AppLayout = ({ children }) => (
  <div className={cx('app-container')}>
    <div className={cx('sidebar-container')}>
      <Sidebar />
    </div>
    <div className={cx('content')}>
      <div className={cx('header-container')} >
        <Header />
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
