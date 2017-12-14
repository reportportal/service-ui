import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';

import LoginPage from '../pages/loginPage/loginPage';
import AppPage from '../pages/appPage/appPage';

const pages = {
  login: LoginPage,
  app: AppPage,
};

const App = ({ currentPage }) => {
  if (currentPage === '') {
    return <div />;
  }
  let Page = pages[currentPage];
  if (!Page) {
    Page = LoginPage;
  }
  return (
    <Page />
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
