import React from 'react';
import { render } from 'react-dom';
import { Container } from '@cerebral/react';

import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

import controller from './controller/controller';
import App from './components/main/app/app';

(controller.getSignal('getInitialData'))();

const rerenderApp = (AppContainer) => {
  render((
    <Container controller={controller} >
      <AppContainer />
    </Container>
  ), document.querySelector('#app'));
};

if (module.hot) {
  module.hot.accept('./components/main/app/app', () => {
    const app = require('./components/main/app/app').default;
    rerenderApp(app);
  });
}
rerenderApp(App);
