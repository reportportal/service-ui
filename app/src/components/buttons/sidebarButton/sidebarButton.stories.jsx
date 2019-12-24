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

import { SidebarButton } from './sidebarButton';
import README from './README.md';
import TestIcon from './img/test-icon-inline.svg';

storiesOf('Components/Buttons/SidebarButton', module)
  .addDecorator(
    host({
      title: 'Sidebar Button component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 50,
      width: 150,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <SidebarButton />)
  .add('with icon', () => (
    <SidebarButton
      icon={TestIcon}
      link={{
        type: 'TEST_ROUTE',
      }}
    >
      Nav Button
    </SidebarButton>
  ))
  .add('active', () => (
    <SidebarButton
      icon={TestIcon}
      link={{
        type: 'INDEX',
      }}
    >
      Nav Button
    </SidebarButton>
  ))
  .add('with actions', () => (
    <SidebarButton
      icon={TestIcon}
      link={{
        type: 'TEST_ROUTE',
      }}
      onClick={action('clicked')}
    >
      Nav Button
    </SidebarButton>
  ));
