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
import { host } from 'storybook-host';

import { LogMessage } from './logMessage';
import README from './README.md';

storiesOf('Components/Main/LogMessage', module)
  .addDecorator(
    host({
      title: 'Log message component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 50,
      width: 150,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('with item', () => {
    const item = {
      message: 'Some log message',
      level: '',
    };
    return <LogMessage item={item} />;
  })
  .add('with item & level = error', () => {
    const item = {
      message: 'Some log message',
      level: 'error',
    };
    return <LogMessage item={item} />;
  });
