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

import { InputConditional } from './inputConditional';
import README from './README.md';

const conditions = [
  {
    value: 'cnt',
    label: 'contains',
    shortLabel: 'cnt',
  },
  {
    value: '!cnt',
    label: 'not contains',
    shortLabel: '!cnt',
    disabled: true,
  },
  {
    value: 'eq',
    label: 'equals',
    shortLabel: 'eq',
  },
  {
    value: '!eq',
    label: 'not equals',
    shortLabel: '!eq',
  },
];

storiesOf('Components/Inputs/InputConditional', module)
  .addDecorator(
    host({
      title: 'Input conditional component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 32,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputConditional />)
  .add('touched & error state', () => <InputConditional touched error={'error'} />)
  .add('with value & conditions', () => (
    <InputConditional
      conditions={conditions}
      value={{
        condition: '!eq',
        value: 'some entered value',
      }}
    />
  ))
  .add('with placeholder', () => (
    <InputConditional
      conditions={conditions}
      placeholder={'placeholder text'}
      value={{
        condition: '!eq',
        value: '',
      }}
    />
  ))
  .add('disabled state', () => (
    <InputConditional
      disabled
      conditions={conditions}
      value={{
        condition: '!eq',
        value: 'some entered value',
      }}
    />
  ))
  .add('with actions', () => (
    <InputConditional
      conditions={conditions}
      value={{
        condition: '!eq',
        value: 'some entered value',
      }}
      onChange={action('change')}
      onFocus={action('focused')}
      onBlur={action('blur')}
    />
  ));
