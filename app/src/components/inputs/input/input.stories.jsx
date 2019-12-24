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

import { Input } from './input';
import README from './README.md';

storiesOf('Components/Inputs/Input', module)
  .addDecorator(
    host({
      title: 'Input component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      height: 30,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <Input />)
  .add('with placeholder', () => <Input placeholder="Placeholder test" />)
  .add('with predefined value', () => <Input value="Predefined text" />)
  .add('with predefined value & readonly', () => <Input readonly value="Predefined text" />)
  .add('with value & type number', () => <Input type="number" value="12345" />)
  .add('with value & type password', () => <Input type="password" value="12345" />)
  .add('max length (10)', () => <Input maxLength="10" />)
  .add('disabled', () => <Input disabled />)
  .add('with actions', () => (
    <Input
      onFocus={action('focus')}
      onChange={action('change')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
      onKeyPress={action('keypress')}
    />
  ));
