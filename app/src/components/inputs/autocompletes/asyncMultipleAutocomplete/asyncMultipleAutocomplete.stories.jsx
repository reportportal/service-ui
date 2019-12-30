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
import { AsyncMultipleAutocomplete } from './asyncMultipleAutocomplete';
import README from './README.md';

const mockData = [
  'best_of_the_best_test_project',
  'best_test_project',
  'super_tester_project',
  'test',
  'test_project',
  'test_project_1',
  'test_project_2',
  'test_project_3',
  'test_project_4',
];

const getProjectSearchUri = (searchTerm) => `/api/v1/project/names/search?term=${searchTerm}`;

const mock = new MockAdapter(axios);
const API_REQUEST = getProjectSearchUri('test');
mock.onGet(API_REQUEST).reply(200, mockData);

storiesOf('Components/Inputs/AsyncMultipleAutocomplete', module)
  .addDecorator(
    host({
      title: 'Async Autocomplete',
      align: 'center middle',
      background: 'white',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      height: 400,
      width: 400,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <AsyncMultipleAutocomplete />)
  .add('with mocked options', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
    />
  ))
  .add('creatable', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      creatable
    />
  ))
  .add('with value', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      value={['super_tester_project']}
    />
  ))
  .add('with multi values', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      value={['super_tester_project', 'test']}
    />
  ))
  .add('With min length (3)', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      minLength={3}
    />
  ))
  .add('disabled', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      minLength={3}
      disabled
    />
  ))
  .add('disabled with value', () => (
    <AsyncMultipleAutocomplete
      getURI={getProjectSearchUri}
      placeholder="Type 'test'"
      onChange={action('Select project')}
      minLength={3}
      disabled
      value={['super_tester_project', 'test']}
    />
  ));
