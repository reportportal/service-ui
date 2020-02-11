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

import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ContainerWithTabs } from './containerWithTabs';
import README from './README.md';

const mockDataContentTypes = [
  { name: 'Text', content: 'some basic text.' },
  { name: 'SomeVeryLongTabName', content: 'With very long tab name' },
  {
    name: 'HTML',
    content: (
      <b>
        Content of second tab bold <small>Content of second tab small</small>
      </b>
    ),
  },
  {
    name: 'Long text',
    content: (
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis eaque ex excepturi fuga
        itaque laborum libero maxime mollitia neque odio quisquam quod repellendus sequi suscipit
        tempora totam velit, voluptate voluptatum.
      </p>
    ),
  },
  { name: 'Component', content: <SpinningPreloader /> },
];
const mockDataManyTabs = [
  { name: 'Text 0', content: 'some basic text 0.' },
  { name: 'Text 1', content: 'some basic text 1.' },
  { name: 'Text 2', content: 'some basic text 2.' },
  { name: 'Text 3', content: 'some basic text 3.' },
  { name: 'Text 4', content: 'some basic text 4.' },
  { name: 'Text 5', content: 'some basic text 5.' },
  { name: 'Text 6', content: 'some basic text 6.' },
  { name: 'Text 7', content: 'some basic text 7.' },
  { name: 'Text 8', content: 'some basic text 8.' },
  { name: 'Text 9', content: 'some basic text 9.' },
  { name: 'Text 10', content: 'some basic text 10.' },
  { name: 'Text 11', content: 'some basic text 11.' },
  { name: 'Text 12', content: 'some basic text 12.' },
  { name: 'Text 13', content: 'some basic text 13.' },
  { name: 'Text 14', content: 'some basic text 14.' },
  { name: 'Text 15', content: 'some basic text 15.' },
];

storiesOf('Components/Main/ContainerWithTabs', module)
  .addDecorator(
    host({
      title: 'Dynamic container with tabs',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#f5f5f5',
      height: 'auto',
      width: '70%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state (no provided info)', () => <ContainerWithTabs />)
  .add('with different data', () => (
    <div id="tooltip-root">
      <ContainerWithTabs data={mockDataContentTypes} />
    </div>
  ))
  .add('with lot of tabs', () => <ContainerWithTabs data={mockDataManyTabs} />);
