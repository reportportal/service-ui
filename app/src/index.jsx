import React from 'react';
import { render } from 'react-dom';
import { Container } from '@cerebral/react';

import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

import controller from './controller/controller';
import App from './app/app';


const rerenderApp = (AppContainer) => {
  render((
    <Container controller={controller} >
      <AppContainer />
    </Container>
  ), document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./app/app', () => {
    const app = require('./app/app').default;
    rerenderApp(app);
  });
}

if (!window.Intl) {
  require.ensure([
    'intl',
    'intl/locale-data/jsonp/en.js',
    'intl/locale-data/jsonp/ru.js',
  ], (require) => {
    require('intl');
    require('intl/locale-data/jsonp/en.js');
    require('intl/locale-data/jsonp/ru.js');
    rerenderApp(App);
  });
} else {
  rerenderApp(App);
}
