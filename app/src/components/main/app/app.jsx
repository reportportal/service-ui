import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import LocalizationContainer from '../localizationContainer/localizationContainer';

import LoginPage from '../../../pages/loginPage/loginPage';
import AppPage from '../../../pages/appPage/appPage';

const pages = {
  login: LoginPage,
  app: AppPage,
};

const App = ({ currentPage, hasLoadedInitialData }) => {
  let content = <div />;
  if (currentPage !== '') {
    let Page = pages[currentPage];
    if (!Page) {
      Page = LoginPage;
    }
    content = <Page />;
  }
  if (!hasLoadedInitialData) {
    content = <div />;
  }
  return (
    <LocalizationContainer>
      {content}
    </LocalizationContainer>
  );
};
App.propTypes = {
  currentPage: PropTypes.string,
  hasLoadedInitialData: PropTypes.bool,
};

App.defaultProps = {
  currentPage: '',
  hasLoadedInitialData: true,
};

export default connect({
  currentPage: state`route.currentPage`,
  hasLoadedInitialData: state`hasLoadedInitialData`,
}, App);
