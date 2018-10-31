import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { createStore, combineReducers } from 'redux';
import { START_TIME_FORMAT_RELATIVE } from 'controllers/user';
import { Provider } from 'react-redux';
import { withReadme } from 'storybook-readme';
import { ProjectActivity } from './projectActivity';
import { data } from './data';
import README from './README.md';

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
  return <Provider store={store}>{getStory()}</Provider>;
};

storiesOf('Pages/Inside/DashboardPage/ProjectActivity', module)
  .addDecorator(
    host({
      title: 'Project activity widget',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 300,
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .addDecorator(withRedux)
  .add('with activity prop', () => <ProjectActivity activity={data} />);
