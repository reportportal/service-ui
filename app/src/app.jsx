import React from 'react';
import PropTypes from 'prop-types';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import PageSwitcher from 'routes/pageSwitcher';
import { LocalizationContainer } from 'components/main/localizationContainer';

const App = ({ initialDispatch }) => (
  <InitialDataContainer initialDispatch={initialDispatch}>
    <LocalizationContainer>
      <PageSwitcher />
    </LocalizationContainer>
  </InitialDataContainer>
);
App.propTypes = {
  initialDispatch: PropTypes.func.isRequired,
};

export default App;
