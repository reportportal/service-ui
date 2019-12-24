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

import { ToggleButton } from './toggleButton';
import README from './README.md';

storiesOf('Components/Buttons/ToggleButton', module)
  .addDecorator(
    host({
      title: 'Toggle button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 50,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <ToggleButton />)
  .add('with 2 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
      ]}
    />
  ))
  .add('with 3 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
    />
  ))
  .add('with 4 items', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
        { value: 'fourth', label: 'fourth' },
      ]}
    />
  ))
  .add('with active item', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value="second"
    />
  ))
  .add('with disabled', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      disabled
    />
  ))
  .add('with active item & disabled', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value="second"
      disabled
    />
  ))
  .add('with separated', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value="second"
      separated
      onChange={action('itemClicked')}
    />
  ))
  .add('with actions', () => (
    <ToggleButton
      items={[
        { value: 'first', label: 'first' },
        { value: 'second', label: 'second' },
        { value: 'third', label: 'third' },
      ]}
      value="second"
      onChange={action('itemClicked')}
    />
  ));
