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

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ProjectPanel } from './projectPanel';
import { state, mockData } from './data';
import README from './README.md';

storiesOf('Pages/Admin/ProjectPanel', module)
  .addDecorator(
    host({
      title: 'Project info block component',
      align: 'center middle',
      background: '#fff',
      height: 160,
      width: 270,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('with data', () => (
    <WithState state={state}>
      <ProjectPanel {...mockData} />
    </WithState>
  ));
