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

import { LaunchStatisticsChart } from './launchStatisticsChart';
import README from './README.md';
import {
  areaViewData,
  barViewData,
  areaTimelineData,
  barTimelineData,
  areaViewWithZoomData,
  state,
} from './data';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/LaunchStatisticsChart', module)
  .addDecorator(
    host({
      title: 'Launch statistics trend chart',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 350,
      margin: 20,
      width: '100%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('area view', () => (
    <WithState state={state}>
      <LaunchStatisticsChart widget={areaViewData} container={mockNode} observer={mockObserver} />
    </WithState>
  ))
  .add('bar view', () => (
    <WithState state={state}>
      <LaunchStatisticsChart widget={barViewData} container={mockNode} observer={mockObserver} />
    </WithState>
  ))
  .add('area view preview', () => (
    <WithState state={state}>
      <LaunchStatisticsChart
        widget={areaViewData}
        isPreview
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('bar view preview', () => (
    <WithState state={state}>
      <LaunchStatisticsChart
        widget={barViewData}
        isPreview
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('area view timeline mode', () => (
    <WithState state={state}>
      <LaunchStatisticsChart
        widget={areaTimelineData}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('bar view timeline mode', () => (
    <WithState state={state}>
      <LaunchStatisticsChart
        widget={barTimelineData}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('area view with zoom mode', () => (
    <WithState state={state}>
      <LaunchStatisticsChart
        widget={areaViewWithZoomData}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ));
