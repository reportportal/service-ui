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

import { InputRadio } from './inputRadio';
import README from './README.md';

const value = 'value';

storiesOf('Components/Inputs/InputRadio', module)
  .addDecorator(
    host({
      title: 'InputRadio component',
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
  .add('default state', () => <InputRadio />)
  .add('with value', () => <InputRadio value={value} />)
  .add('checked', () => <InputRadio ownValue={value} value={value} />)
  .add('with text', () => <InputRadio>Some text.</InputRadio>)
  .add('with long text', () => (
    <InputRadio>Some long text. Some long text. Some long text. Some long text.</InputRadio>
  ))
  .add('with circleAtTop & long text', () => (
    <InputRadio circleAtTop>
      Some long text. Some long text. Some long text. Some long text.
    </InputRadio>
  ))
  .add('disabled', () => <InputRadio disabled />)
  .add('disabled with value', () => <InputRadio disabled value={value} />)
  .add('disabled with text', () => <InputRadio disabled>Some text.</InputRadio>)
  .add('with value & actions', () => (
    <InputRadio
      value={value}
      onFocus={action('focus')}
      onChange={action('change')}
      onBlur={action('blur')}
    />
  ));
