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
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';

import { GhostMenuButton } from './ghostMenuButton';
import README from './README.md';

const items = [
  {
    label: 'Item label',
    value: 'First item value',
    onClick: action('clicked'),
  },
  {
    label: 'Item label',
    value: 'Second item value',
    onClick: action('clicked'),
  },
];

storiesOf('Components/Buttons/GhostMenuButton', module)
  .addDecorator(
    host({
      title: 'Ghost menu button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 50,
      width: 150,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <GhostMenuButton />)
  .add('with title', () => <GhostMenuButton title="Menu title" />)
  .add('with title & items & actions', () => <GhostMenuButton items={items} title="Menu title" />)
  .add('disabled with title & items & actions', () => (
    <GhostMenuButton disabled items={items} title="Menu title" />
  ));
