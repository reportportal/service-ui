import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import RootRoute from 'routes/rootRoute';
import { LocalizationContainer } from 'components/main/localizationContainer';

const App = () => (
  <Provider store={store}>
    <InitialDataContainer>
      <LocalizationContainer>
        <RootRoute />
      </LocalizationContainer>
    </InitialDataContainer>
  </Provider>
);

export default App;
