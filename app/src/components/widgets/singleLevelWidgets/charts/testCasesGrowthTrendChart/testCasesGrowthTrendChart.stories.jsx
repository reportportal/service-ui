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

import 'c3/c3.css';
import { TestCasesGrowthTrendChart } from './testCasesGrowthTrendChart';
import { state, widgetData, widgetDataTimelineMode } from './storyData';
import README from './README.md';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/TestCasesGrowthTrendChart', module)
  .addDecorator(
    host({
      title: 'Test Cases Growth Trend Chart component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 360,
      width: 640,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart widget={widgetData} container={mockNode} observer={mockObserver} />
    </WithState>
  ))
  .add('preview mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetData}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ))
  .add('timeline mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetDataTimelineMode}
        container={mockNode}
        observer={mockObserver}
      />
    </WithState>
  ))
  .add('timeline preview mode', () => (
    <WithState state={state}>
      <TestCasesGrowthTrendChart
        widget={widgetDataTimelineMode}
        container={mockNode}
        observer={mockObserver}
        isPreview
      />
    </WithState>
  ));
