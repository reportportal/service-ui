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

import { InvestigatedTrendChart } from './investigatedTrendChart';
import { TEST_DATA } from './test-data';
import README from './README.md';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/investigatedTrendChart', module)
  .addDecorator(
    host({
      title: 'Investigated Trend Chart (Investigated Percentage of Launches)',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 350,
      width: 500,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('launch mode', () => (
    <InvestigatedTrendChart
      widget={TEST_DATA.launchMode}
      container={mockNode}
      observer={mockObserver}
    />
  ))
  .add('launch mode preview', () => (
    <InvestigatedTrendChart
      widget={TEST_DATA.launchMode}
      isPreview
      container={mockNode}
      observer={mockObserver}
    />
  ))
  .add('timeline mode', () => (
    <InvestigatedTrendChart
      widget={TEST_DATA.timelineMode}
      container={mockNode}
      observer={mockObserver}
    />
  ))
  .add('timeline mode preview', () => (
    <InvestigatedTrendChart
      widget={TEST_DATA.timelineMode}
      isPreview
      container={mockNode}
      observer={mockObserver}
    />
  ));
