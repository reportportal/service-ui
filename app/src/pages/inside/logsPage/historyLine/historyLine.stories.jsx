import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { action } from '@storybook/addon-actions';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators/withState';
import { HistoryLine } from './historyLine';
import { mockEntries } from './data';
import README from './README.md';

const defaultState = {
  user: {
    activeProject: '',
  },
  notifications: [],
  location: {
    payload: {
      projectId: '',
      filterId: '',
    },
  },
  log: {
    logEntries: [],
    activeItemId: '',
    itemToGetHistory: '',
  },
};

const state = {
  user: {
    activeProject: 'amsterget_personal',
  },
  notifications: [],
  location: {
    payload: {
      projectId: 'amsterget_personal',
      filterId: 'all',
      testItemIds: '5b75a36397a1c00001ea3d4f',
    },
  },
  log: {
    logEntries: mockEntries,
    activeItemId: '5b75a36397a1c00001ea3d4f',
  },
};

storiesOf('Pages/inside/LogsPage/HistoryLine', module)
  .addDecorator(
    host({
      title: 'History Line component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 'auto',
      width: '100%',
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <WithState state={defaultState}>
      <HistoryLine />
    </WithState>
  ))
  .add('with mock data', () => (
    <WithState state={state}>
      <HistoryLine />
    </WithState>
  ))
  .add('with mock data & actions', () => (
    <WithState state={state}>
      <HistoryLine onItemSelect={action('onItemSelect')} />
    </WithState>
  ));
