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
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { host } from 'storybook-host';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { InputConditionalTags } from './inputConditionalTags';
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

const value = {
  condition: '!eq',
  value: 'some entered value',
};

const state = {
  user: {
    activeProject: 'superadmin_personal',
  },
};

storiesOf('Components/Inputs/InputConditionalTags', module)
  .addDecorator(
    host({
      title: 'Input conditional tags component',
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
  .add('default state', () => (
    <WithState state={state}>
      <InputConditionalTags />
    </WithState>
  ))
  .add('with value', () => (
    <WithState state={state}>
      <InputConditionalTags value={value} />
    </WithState>
  ))
  .add('with value & conditions', () => (
    <WithState state={state}>
      <InputConditionalTags value={value} conditions={conditions} />
    </WithState>
  ))
  .add('with placeholder & conditions', () => (
    <WithState state={state}>
      <InputConditionalTags
        placeholder="Placeholder"
        value={{
          condition: '!eq',
          value: '',
        }}
        conditions={conditions}
      />
    </WithState>
  ))
  .add('with actions (type "de" in input, close DevTools, you get MOCK DATA)', () => {
    const mock = new MockAdapter(axios);
    const uri = '/api/v1/superadmin_personal/launch/tags?filter.cnt.tags=';
    const API_REQUEST = `${uri}de`;
    mock.onGet(API_REQUEST).reply(200, ['demo', 'desktop']);
    return (
      <WithState state={state}>
        <InputConditionalTags
          getURI={(term) => `${uri}${term}`}
          conditions={conditions}
          value={value}
          placeholder="Enter Login or Email"
          onChange={action('Select tag')}
          onFocus={action('focus')}
          onBlur={action('blur')}
        />
      </WithState>
    );
  });
