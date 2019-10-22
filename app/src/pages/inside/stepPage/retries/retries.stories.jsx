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
import { SKIPPED, FAILED } from 'common/constants/testStatuses';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
import { Retries } from './retries';

const state = {
  location: {
    payload: {
      projectId: 'project',
      filterId: 'all',
      testItemIds: '1/2/3',
    },
  },
};

const RETRIES = [
  {
    id: 0,
    name: 'retry one',
    status: SKIPPED,
    endTime: 1537362751956,
    startTime: 1537362751945,
    description: 'test\ntest\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1test',
  },
  {
    id: 1,
    name: 'retry one',
    status: FAILED,
    endTime: 1537362751956,
    startTime: 1537362751945,
    description: 'test',
  },
];

storiesOf('Pages/Inside/StepPage/Retries', module)
  .addDecorator(
    host({
      title: 'Retries component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 300,
      width: 800,
    }),
  )
  .add('default state', () => (
    <WithState state={state}>
      <Retries selectedId={0} selectedIndex={0} testItemId={1} />
    </WithState>
  ))
  .add('with retries', () => (
    <WithState state={state}>
      <Retries
        retries={RETRIES}
        selectedId={0}
        selectedIndex={0}
        testItemId={1}
        onRetrySelect={action('select')}
        logItem={{}}
      />
    </WithState>
  ))
  .add('with message', () => (
    <WithState state={state}>
      <Retries
        retries={RETRIES}
        selectedId={0}
        selectedIndex={0}
        testItemId={1}
        onRetrySelect={action('select')}
        logItem={{
          message: 'test\ntest\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1\n1test',
        }}
      />
    </WithState>
  ))
  .add('with actions', () => (
    <WithState state={state}>
      <Retries
        retries={RETRIES}
        selectedId={0}
        selectedIndex={0}
        testItemId={1}
        onRetrySelect={action('select')}
      />
    </WithState>
  ));
