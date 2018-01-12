import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import classNames from 'classnames/bind';
import LocalizationContainer from '../localizationContainer/localizationContainer';
import styles from './app.scss';

import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import Notification from '../notification/notification';

import LoginPage from '../../../pages/loginPage/loginPage';
import AppPage from '../../../pages/appPage/appPage';

const PAGES = {
  login: {
    container: 'empty',
    page: LoginPage,
  },
  app: {
    container: 'app',
    page: AppPage,
  },
};

const cx = classNames.bind(styles);

const App = ({ currentPage }) => {
  function getContainer(pageName) {
    let result = <div />;
    if (pageName === '' || !PAGES[pageName]) {
      return result;
    }
    const Page = PAGES[pageName].page;
    switch (PAGES[pageName].container) {
      case 'empty':
        result = (
          <div className={cx('empty-container')}>
            <Page />
            <Notification />
          </div>
        );
        break;
      case 'app':
        result = (
          <div className={cx('app-container')}>
            <div className={cx('sidebar-container')}>
              <Sidebar />
            </div>
            <div className={cx('content')}>
              <div className={cx('header-container')}>
                <Header />
              </div>
              <div className={cx('page-container')}>
                <Page />
              </div>
            </div>
            <Notification />
          </div>
        );
        break;
      default:
        break;
    }
    return result;
  }
  return (
    <LocalizationContainer>
      {getContainer(currentPage)}
    </LocalizationContainer>
  );
};
App.propTypes = {
  currentPage: PropTypes.string,
};

App.defaultProps = {
  currentPage: '',
};

export default connect({
  currentPage: state`route.currentPage`,
}, App);
