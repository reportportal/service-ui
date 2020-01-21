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

import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { action } from '@storybook/addon-actions';

import { NotificationItem } from './notificationItem';
import README from './README.md';

storiesOf('Components/Main/Notification', module)
  .addDecorator(
    host({
      title: 'Notification component',
      align: 'center middle',
      backdrop: '#ffffff',
      background: '#E9E9E9',
      height: 500,
      width: 600,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => (
    <NotificationItem uid={1} onMessageClick={action('onMessageClick')} />
  ))
  .add('simple message', () => (
    <NotificationItem uid={1} onMessageClick={action('onMessageClick')} message="Simple message" />
  ))
  .add('error message', () => (
    <NotificationItem
      uid={1}
      onMessageClick={action('onMessageClick')}
      message="Simple message"
      type="error"
    />
  ))
  .add('success message', () => (
    <NotificationItem
      uid={1}
      onMessageClick={action('onMessageClick')}
      message="Simple message"
      type="success"
    />
  ))
  .add('long message', () => (
    <NotificationItem
      uid={1}
      onMessageClick={action('onMessageClick')}
      message="It makes perfect sense for us to write our UIs in a declarative manner. The reason is that we need to reuse UI elements and compose them together in different configurations. One can also claim that declarative code reads better, not because it is less syntax, but because you only describe what you want, not how you want it."
    />
  ));
