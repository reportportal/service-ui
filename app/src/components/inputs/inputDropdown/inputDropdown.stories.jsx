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

import { InputDropdown } from './inputDropdown';
import README from './README.md';

const options = [
  {
    value: 'AI',
    label: 'Auto Bug',
    disabled: false,
  },
  {
    value: 'PB',
    label: 'Product Bug',
    disabled: true,
  },
  {
    value: 'SI',
    label: 'System Issue',
    disabled: true,
  },
  {
    value: 'ND',
    label: 'No Defect',
    disabled: false,
  },
  {
    value: 'TI',
    label: 'To invest',
    disabled: false,
  },
];

storiesOf('Components/Inputs/InputDropdown', module)
  .addDecorator(
    host({
      title: 'InputDropdown component',
      align: 'center top',
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
  // Single dropdown
  .add('Single, default state', () => <InputDropdown options={options} />)
  .add('Single, disabled', () => <InputDropdown options={options} disabled />)
  .add('Single, with actions', () => (
    <InputDropdown
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
    />
  ))
  .add('Single, with actions, value', () => (
    <InputDropdown
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
      value="ND"
    />
  ))
  // Multiple dropdown
  .add('Multiple, default state', () => <InputDropdown options={options} multiple />)
  .add('Multiple, disabled', () => <InputDropdown options={options} multiple disabled />)
  .add('Multiple, select all, value', () => (
    <InputDropdown options={options} multiple selectAll value={['ND', 'AI']} />
  ))
  .add('Multiple, with actions', () => (
    <InputDropdown
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
      multiple
    />
  ))
  .add('Multiple, select all, with actions', () => (
    <InputDropdown
      options={options}
      onChange={action('changed')}
      onBlur={action('blured')}
      onFocus={action('focused')}
      multiple
      selectAll
    />
  ));
