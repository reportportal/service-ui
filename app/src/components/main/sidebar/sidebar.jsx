import React from 'react';
import classNames from 'classnames/bind';
import styles from './sidebar.scss';

const cx = classNames.bind(styles);

const Sidebar = () => (
  <div className={cx('sidebar')} />
  );

export default Sidebar;
