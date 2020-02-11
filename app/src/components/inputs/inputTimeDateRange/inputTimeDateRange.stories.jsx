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

import moment from 'moment/moment';
import { InputTimeDateRange } from './inputTimeDateRange';
import README from './README.md';

const presets = [
  {
    label: 'Today',
    value: {
      start: moment()
        .startOf('day')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last 2 days',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'days')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last week',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'weeks')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last month',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'months')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
];

const value = {
  start: moment()
    .startOf('day')
    .valueOf(),
  end:
    moment()
      .endOf('day')
      .valueOf() + 1,
  dynamic: true,
};

storiesOf('Components/Inputs/InputTimeDateRange', module)
  .addDecorator(
    host({
      title: 'Input time date range component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 70,
      width: 300,
    }),
  )
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
  .add('default state', () => <InputTimeDateRange />)
  .add('with value', () => <InputTimeDateRange value={value} />)
  .add('with presets', () => <InputTimeDateRange presets={presets} />)
  .add('with actions', () => (
    <InputTimeDateRange
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
    />
  ));
