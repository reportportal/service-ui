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
import { action } from '@storybook/addon-actions';

import { InputConditional } from 'components/inputs/inputConditional';
import { FieldFilterEntity } from './fieldFilterEntity';
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

storiesOf('Components/Fields/FieldFilterEntity', module)
  .addDecorator(
    host({
      title: 'Field filer entity',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 60,
      width: 260,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <FieldFilterEntity />)
  .add('without removable', () => <FieldFilterEntity removable={false} />)
  .add('with children', () => (
    <FieldFilterEntity title={'Launch name'}>
      <InputConditional
        conditions={conditions}
        value={{
          condition: '!eq',
          value: 'some entered value',
        }}
      />
    </FieldFilterEntity>
  ))
  .add('with children & stretchable & actions', () => (
    <FieldFilterEntity title={'Launch name'} stretchable onRemove={action('remove')}>
      <InputConditional
        conditions={conditions}
        value={{
          condition: '!eq',
          value: 'some entered value',
        }}
      />
    </FieldFilterEntity>
  ));
