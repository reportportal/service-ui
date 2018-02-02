import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialData } from 'controllers/initialData';
import RootRoute from 'routes/rootRoute';
import { LocalizationContainer } from 'components/main/localizationContainer';

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
