import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import LoginPage from '../pages/loginPage/loginPage';
import AppPage from '../pages/appPage/appPage';

import localeRU from '../../localization/translated/ru.json';

addLocaleData([...en, ...ru]);
const language = 'en';
const messages = {
  ru: localeRU,
};

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
    <IntlProvider locale={language} messages={messages[language]}>
      {content}
    </IntlProvider>
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
