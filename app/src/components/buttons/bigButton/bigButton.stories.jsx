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

import { BigButton } from './bigButton';
import README from './README.md';

storiesOf('Components/Buttons/BigButton', module)
  .addDecorator(
    host({
      title: 'Big button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 50,
      width: 200,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <BigButton />)
  .add('with text', () => <BigButton>Button title</BigButton>)
  .add('with roundedCorners & text', () => <BigButton roundedCorners>Button title</BigButton>)
  .add('colored', () => <BigButton color="organish">Button title</BigButton>)
  .add('disabled', () => <BigButton disabled>Button title</BigButton>)
  .add('with actions', () => <BigButton onClick={action('clicked')}>Button title</BigButton>)
  .add('disabled with actions', () => (
    <BigButton disabled onClick={action('clicked')}>
      Button title
    </BigButton>
  ));
