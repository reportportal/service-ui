import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import { createHashHistory } from 'history';
import qhistory from 'qhistory';

import { stringify, parse } from 'qs';

import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

import App from './app';


const queryParseHistory = qhistory(
  createHashHistory({ hashType: 'noslash' }),
  stringify,
  parse,
);

const rerenderApp = (AppContainer) => {
  render((
    <Router history={queryParseHistory}>
      <AppContainer />
    </Router>
  ), document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./app', () => {
    const app = require('./app').default;
    rerenderApp(app);
  });
}
rerenderApp(App);
