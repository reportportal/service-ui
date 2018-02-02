import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialData } from 'controllers/initialData';
import RootRoute from 'routes/rootRoute';
import { LocalizationContainer } from 'components/main/localizationContainer';

const App = () => (
  <Provider store={store}>
    <InitialData>
      <LocalizationContainer>
        <RootRoute />
      </LocalizationContainer>
    </InitialData>
  </Provider>
);

export default App;
