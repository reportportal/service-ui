import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import {
  START_TIME_FORMAT_RELATIVE,
} from 'controllers/user';
import MostFailedTests from './mostFailedTests';
import { failedTests } from './data';

const withRedux = (getStory) => {
  const initialState = {
    settings: {
      startTimeFormat: START_TIME_FORMAT_RELATIVE,
    },
  };
  const rootReducer = combineReducers({
    user: (state = initialState) => state,
  });
  const store = createStore(rootReducer);
  return (
    <Provider store={store}>
      {getStory()}
    </Provider>
  );
};

storiesOf('Pages/inside/dashboardPage/failedTests', module)
  .addDecorator(host({
    title: 'Flaky tests',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 300,
    width: '100%',
  }))
  .addDecorator(withRedux)
  .add('default state', () => (
    <MostFailedTests
      launch={failedTests.launch}
      tests={failedTests.tests}
      nameClickHandler={action('Test id: ')}
    />
  ));
