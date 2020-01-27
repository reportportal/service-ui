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

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { InputUserSearch } from './inputUserSearch';
import { mockData } from './data';
import README from './README.md';

storiesOf('Components/Inputs/InputUserSearch', module)
  .addDecorator(
    host({
      title: 'Input user search',
      align: 'center middle',
      background: 'white',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      height: 280,
      width: 550,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputUserSearch />)
  .add('non admin, projectId="superadmin_personal", with actions', () => {
    const mock = new MockAdapter(axios);
    const API_REQUEST =
      '/api/v1/project/superadmin_personal/usernames/search?page.page=1&page.size=10&page.sort=user%2CASC&term=e';
    mock.onGet(API_REQUEST).reply(200, mockData);
    return (
      <InputUserSearch
        placeholder="Type 'e'"
        onChange={action('Select user')}
        projectId="superadmin_personal"
      />
    );
  })
  .add('Admin,projectId="superadmin_personal", with actions', () => {
    const mock = new MockAdapter(axios);
    const API_REQUEST = '/api/v1/user/search?term=e';
    mock.onGet(API_REQUEST).reply(200, mockData);
    return (
      <InputUserSearch
        isAdmin
        projectId="superadmin_personal"
        placeholder="Type 'e'"
        onChange={action('Select user')}
      />
    );
  });
