/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
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
    historyEntries: mockEntries,
  },
};

storiesOf('Pages/Inside/LogsPage/HistoryLine', module)
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
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <WithState state={defaultState}>
      <HistoryLine />
    </WithState>
  ))
  .add('with mock data', () => (
    <WithState state={state}>
      <HistoryLine />
    </WithState>
  ));
