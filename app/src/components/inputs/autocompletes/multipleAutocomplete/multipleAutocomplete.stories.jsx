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
import { MultipleAutocomplete } from './multipleAutocomplete';
import README from './README.md';

const options = [
  'best_of_the_best_project',
  'best_project',
  'super_tester_project',
  'test',
  'test_project',
  'test_project_1',
  'test_project_2',
  'test_project_3',
  'test_project_4',
];

storiesOf('Components/Inputs/MultipleAutocomplete', module)
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
  .add('default state', () => <MultipleAutocomplete />)
  .add('with options', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
    />
  ))
  .add('with dynamic prompt', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      showDynamicSearchPrompt
    />
  ))
  .add('creatable', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      creatable
    />
  ))
  .add('with value', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      value={['super_tester_project']}
    />
  ))
  .add('with multi values', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      value={['super_tester_project', 'test']}
    />
  ))
  .add('With min length (3)', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      minLength={3}
    />
  ))
  .add('disabled', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      minLength={3}
      disabled
    />
  ))
  .add('disabled with value', () => (
    <MultipleAutocomplete
      options={options}
      placeholder="Type ..."
      onChange={action('Change project')}
      minLength={3}
      disabled
      value={['super_tester_project', 'test']}
    />
  ));
