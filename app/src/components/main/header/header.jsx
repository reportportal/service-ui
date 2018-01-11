import React from 'react';
import classNames from 'classnames/bind';
import styles from './header.scss';

const cx = classNames.bind(styles);

const Header = () => (
  <div className={cx('header')} />
);

export default Header;
