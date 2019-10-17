import React from 'react';
import PropTypes from 'prop-types';
import { LocalizationContainer } from 'components/containers/localizationContainer';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import PageSwitcher from 'routes/pageSwitcher';

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
