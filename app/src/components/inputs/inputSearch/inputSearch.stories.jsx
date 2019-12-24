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

import { InputSearch } from './inputSearch';
import README from './README.md';

const value = 'value';

storiesOf('Components/Inputs/InputSearch', module)
  .addDecorator(
    host({
      title: 'InputSearch component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 40,
      width: 280,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputSearch />)
  .add('with value', () => <InputSearch value={value} />)
  .add('with placeholder', () => <InputSearch placeholder="Placeholder test" />)
  .add('max length (10)', () => <InputSearch maxLength="10" />)
  .add('active', () => <InputSearch active />)
  .add('with actions', () => (
    <InputSearch
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ))
  .add('disabled', () => <InputSearch disabled />)
  .add('disabled with value', () => <InputSearch disabled value={value} />)
  .add('disabled with actions', () => (
    <InputSearch
      disabled
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ));
