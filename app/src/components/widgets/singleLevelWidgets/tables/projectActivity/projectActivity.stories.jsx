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
import { START_TIME_FORMAT_RELATIVE } from 'controllers/user';

// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { ProjectActivity } from './projectActivity';
import { data } from './data';
import README from './README.md';

const state = {
  user: {
    settings: {
      startTimeFormat: START_TIME_FORMAT_RELATIVE,
    },
  },
};

const widget = {
  content: {
    result: data,
  },
};

storiesOf('Components/Widgets/Tables/ProjectActivity', module)
  .addDecorator(
    host({
      title: 'Project activity widget',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 300,
      width: '100%',
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('with activity prop', () => (
    <WithState state={state}>
      <ProjectActivity widget={widget} />
    </WithState>
  ));
