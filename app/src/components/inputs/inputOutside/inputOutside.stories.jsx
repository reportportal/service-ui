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

import TestIcon from './img/test-icon-inline.svg';
import { InputOutside } from './inputOutside';
import README from './README.md';

storiesOf('Components/Inputs/InputOutside', module)
  .addDecorator(
    host({
      title: 'InputOutside component',
      align: 'center top',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 45,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputOutside />)
  .add('with placeholder', () => <InputOutside placeholder="Placeholder test" />)
  .add('with predefined value', () => <InputOutside value="Predefined text" />)
  .add('with predefined value & readonly', () => <InputOutside readonly value="Predefined text" />)
  .add('with icon', () => <InputOutside icon={TestIcon} />)
  .add('type number', () => <InputOutside type="number" value="value" />)
  .add('with value & type password', () => <InputOutside type="password" value="value" />)
  .add('max length (10)', () => <InputOutside maxLength="10" />)
  .add('with error & touched', () => <InputOutside touched error="Something went wrong" />)
  .add('disabled', () => <InputOutside disabled />)
  .add('disabled with value', () => <InputOutside disabled value="value" />)
  .add('with actions', () => (
    <InputOutside
      onFocus={action('focus')}
      onChange={action('change')}
      onBlur={action('blur')}
      onKeyUp={action('keyup')}
    />
  ));
