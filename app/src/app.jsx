import React from 'react';
import { render } from 'react-dom';
import { Container } from '@cerebral/react';
import 'reset-css';
import 'common/css/fonts/fonts.scss';
import 'common/css/common.scss';

import controller from './controller/controller';
import RouteContainer from './components/routeContainer/routeContainer';

const rerenderApp = (AppContainer) => {
  render((
    <Container controller={controller} >
      <AppContainer />
    </Container>
  ), document.querySelector('#app'));
};

rerenderApp(RouteContainer);
if (module.hot) {
  module.hot.accept('./components/routeContainer/routeContainer', () => {
    const app = require('./components/routeContainer/routeContainer').default;
    rerenderApp(app);
  });
}
