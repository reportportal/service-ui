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
import { GhostButton } from './ghostButton';
import README from './README.md';

storiesOf('Components/Buttons/GhostButton', module)
  .addDecorator(
    host({
      title: 'Ghost button component',
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
  .add('default state', () => <GhostButton />)
  .add('with children', () => <GhostButton>Button title</GhostButton>)
  .add('with icon', () => <GhostButton icon={TestIcon} />)
  .add('with icon & children', () => <GhostButton icon={TestIcon}>Button title</GhostButton>)
  .add('with tiny & children', () => <GhostButton tiny>Button title</GhostButton>)
  .add('disabled with children', () => <GhostButton disabled>Button title</GhostButton>)
  .add('disabled with icon', () => <GhostButton icon={TestIcon} disabled />)
  .add('disabled with icon & children', () => (
    <GhostButton icon={TestIcon} disabled>
      Button title
    </GhostButton>
  ))
  .add('with actions', () => <GhostButton onClick={action('clicked')}>Button title</GhostButton>)
  .add('disabled with actions', () => (
    <GhostButton disabled onClick={action('clicked')}>
      Button title
    </GhostButton>
  ));
