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

import { InputBigSwitcher } from './inputBigSwitcher';
import README from './README.md';

storiesOf('Components/Inputs/InputBigSwitcher', module)
  .addDecorator(
    host({
      title: 'InputBigSwitcher component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 80,
      width: 300,
      padding: 15,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputBigSwitcher />)
  .add('turned-on', () => <InputBigSwitcher value>Some text.</InputBigSwitcher>)
  .add('disabled', () => <InputBigSwitcher disabled>Some text.</InputBigSwitcher>)
  .add('turned-on disabled', () => (
    <InputBigSwitcher value disabled>
      Some text.
    </InputBigSwitcher>
  ))
  .add('with long text', () => (
    <InputBigSwitcher>
      Some very long text. Some very long text. Some very long text. Some very long text.
    </InputBigSwitcher>
  ))
  .add('with actions', () => (
    <InputBigSwitcher
      onChange={action('changed')}
      onFocus={action('onFocus')}
      onBlur={action('onBlur')}
    >
      Some text.
    </InputBigSwitcher>
  ))
  .add('disabled with actions', () => (
    <InputBigSwitcher
      onChange={action('changed')}
      onFocus={action('onFocus')}
      onBlur={action('onBlur')}
      disabled
    >
      Some text.
    </InputBigSwitcher>
  ));
