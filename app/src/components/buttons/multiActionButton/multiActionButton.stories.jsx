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

import { MultiActionButton } from './multiActionButton';
import README from './README.md';

const items = [
  {
    label: 'Save and post issue',
    value: 'Post',
    onClick: action('clicked save and post'),
  },
  {
    label: 'Save and link issue',
    value: 'Link',
    onClick: action('clicked save and link'),
  },
  {
    label: 'Save and unlink issue',
    value: 'Unlink',
    onClick: action('clicked save and unlink'),
    disabled: true,
  },
];

storiesOf('Components/Buttons/MultiActionButton', module)
  .addDecorator(
    host({
      title: 'Multi action button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 130,
      width: 170,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <MultiActionButton />)
  .add('with title', () => <MultiActionButton title="Save" />)
  .add('with title & disabled', () => <MultiActionButton title="Save" disabled />)
  .add('with title & items & actions', () => (
    <MultiActionButton onClick={action('clicked save')} items={items} title="Save" />
  ));
