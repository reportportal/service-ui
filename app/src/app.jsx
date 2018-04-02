import React from 'react';
import { Provider } from 'react-redux';
import store from 'store';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import PageSwitcher from 'routes/pageSwitcher';
import { LocalizationContainer } from 'components/main/localizationContainer';

const App = () => (
    <InitialDataContainer>
      <LocalizationContainer>
        <PageSwitcher />
      </LocalizationContainer>
    </InitialDataContainer>
);

export default App;
