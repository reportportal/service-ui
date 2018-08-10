/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators/withState';
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
  .addDecorator(withReadme(README))
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
    const API_REQUEST = '/api/v1/superadmin_personal/launch/tags?filter.cnt.tags=de';
    mock.onGet(API_REQUEST).reply(200, ['demo', 'desktop']);
    return (
      <WithState state={state}>
        <InputConditionalTags
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
