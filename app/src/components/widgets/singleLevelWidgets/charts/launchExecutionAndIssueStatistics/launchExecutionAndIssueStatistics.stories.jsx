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
import React from 'react';
import { LaunchExecutionAndIssueStatistics } from './launchExecutionAndIssueStatistics';
import README from './README.md';
import { widgetData, state } from './data';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/LaunchExecutionAndIssueStatistics', module)
  .addDecorator(
    host({
      title: 'Launch Execution And Issue Statistics Component',
      align: 'center middle',
      height: 400,
      width: 800,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <WithState state={state}>
      <LaunchExecutionAndIssueStatistics
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))

  .add('preview', () => (
    <WithState state={state}>
      <LaunchExecutionAndIssueStatistics
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ));
