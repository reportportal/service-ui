/*
 * Copyright 2017 EPAM Systems
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
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import React from 'react';
import { LaunchExecutionAndIssueStatistics } from './launchExecutionAndIssueStatistics';
import README from './README.md';

const widgetData = {
  share: false,
  id: 13,
  name: 'start11',
  content_parameters: {
    widget_type: 'overall_statistics',
    content_fields: [
      'statistics$executions$passed',
      'statistics$executions$skipped',
      'statistics$defects$product_bug$pb001',
      'statistics$defects$automation_bug$ab001',
      'statistics$executions$failed',
      'statistics$executions$total',
    ],
    itemsCount: 10,
    widgetOptions: {
      latest: '',
    },
  },
  applied_filters: [
    {
      share: false,
      id: 1,
      name: 'launch name',
      conditions: [],
      orders: [
        {
          sorting_column: 'statistics$defects$no_defect$nd001',
          is_asc: false,
        },
      ],
      type: 'Launch',
    },
  ],
  content: {
    result: [
      {
        values: {
          statistics$executions$passed: '8',
          statistics$executions$skipped: '6',
          statistics$defects$product_bug$pb001: '0',
          statistics$defects$automation_bug$ab001: '0',
          statistics$executions$failed: '13',
          statistics$executions$total: '27',
        },
      },
    ],
  },
};

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};

storiesOf('Components/Widgets/Charts/LaunchExecutionAndIssueStatistics', module)
  .addDecorator(
    host({
      title: 'Launch Execution And Issue Statistics Component',
      align: 'center middle',
      height: 400,
      width: 800,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <LaunchExecutionAndIssueStatistics
      widget={widgetData}
      container={mockNode}
      observer={mockObserver}
    />
  ));
