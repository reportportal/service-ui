import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialData } from 'controllers/initialData';
import LocalizationContainer from '../localizationContainer/localizationContainer';

import RootRoute from 'routes/rootRoute';

const App = () => (
  <Provider store={store}>
    <LocalizationContainer>
      <InitialData>
        <RootRoute />
      </InitialData>
    </LocalizationContainer>
  </Provider>
);

export default App;
