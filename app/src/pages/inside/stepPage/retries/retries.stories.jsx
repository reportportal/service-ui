/*
 * Copyright 2018 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
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
