import React from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';

import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

import App from './app';

const rerenderApp = (AppContainer) => {
  render((
    <HashRouter>
      <AppContainer />
    </HashRouter>
  ), document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./app', () => {
    const app = require('./app').default;
    rerenderApp(app);
  });
}
rerenderApp(App);
