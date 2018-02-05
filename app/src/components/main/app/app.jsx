import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import RootRoute from 'routes/rootRoute';
import LocalizationContainer from '../localizationContainer/localizationContainer';

const App = () => (
  <Provider store={store}>
    <LocalizationContainer>
      <InitialDataContainer>
        <RootRoute />
      </InitialDataContainer>
    </LocalizationContainer>
  </Provider>
);

export default App;
