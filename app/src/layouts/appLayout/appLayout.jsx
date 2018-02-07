import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { Notification } from 'components/main/notification';
import { Sidebar } from './sidebar';
import { Header } from './header';
import styles from './appLayout.scss';

const cx = classNames.bind(styles);

export const AppLayout = ({ children }) => (
  <ScrollWrapper>
    <div className={cx('app-container')}>
      <div className={cx('sidebar-container')}>
        <div className={cx('rp-logo')} />
        <Sidebar />
      </div>
      <div className={cx('content')}>
        <ScrollWrapper>
          <div className={cx('header-container')} >
            <Header />
          </div>
          <div className={cx('page-container')}>
            {children}
          </div>
        </ScrollWrapper>
      </div>
    </div>
    <Notification />
  </ScrollWrapper>
);

AppLayout.propTypes = {
  children: PropTypes.node,
};

AppLayout.defaultProps = {
  children: null,
};
