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

export default {
  share: false,
  id: 19,
  name: 'cumulative test',
  contentParameters: {
    contentFields: [
      'statistics$executions$failed',
      'statistics$executions$passed',
      'statistics$executions$skipped',
      'statistics$executions$total',
    ],
    itemsCount: 2,
    widgetOptions: {
      prefix: 'build',
    },
  },
  appliedFilters: [
    {
      share: false,
      id: 1,
      name: 'launch name',
      conditions: [
        {
          filteringField: 'project_id',
          condition: 'eq',
          value: '2',
        },
        {
          filteringField: 'mode',
          condition: 'eq',
          value: 'DEFAULT',
        },
        {
          filteringField: 'status',
          condition: 'ne',
          value: 'IN_PROGRESS',
        },
      ],
      orders: [
        {
          sortingColumn: 'statistics$executions$total',
          is_asc: false,
        },
      ],
      type: 'Launch',
    },
  ],
  content: {
    result: {
      'build:3.10.2': [
        {
          id: 4,
          number: 4,
          name: 'launch name test',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '2',
            statistics$executions$passed: '12',
            statistics$executions$skipped: '24',
            statistics$executions$total: '36',
          },
        },
        {
          id: 2,
          number: 2,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '11',
            statistics$executions$passed: '11',
            statistics$executions$skipped: '13',
            statistics$executions$total: '2',
          },
        },
        {
          id: 1,
          number: 1,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '7',
            statistics$executions$passed: '3',
            statistics$executions$skipped: '18',
            statistics$executions$total: '12',
          },
        },
        {
          id: 3,
          number: 3,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '21',
            statistics$executions$passed: '1',
            statistics$executions$skipped: '16',
            statistics$executions$total: '1',
          },
        },
      ],
      'build:3.10.3': [
        {
          id: 4,
          number: 4,
          name: 'launch name test',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '20',
            statistics$executions$passed: '2',
            statistics$executions$skipped: '14',
            statistics$executions$total: '16',
          },
        },
        {
          id: 2,
          number: 2,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '11',
            statistics$executions$passed: '11',
            statistics$executions$skipped: '13',
            statistics$executions$total: '2',
          },
        },
        {
          id: 1,
          number: 1,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '17',
            statistics$executions$passed: '13',
            statistics$executions$skipped: '18',
            statistics$executions$total: '21',
          },
        },
        {
          id: 3,
          number: 3,
          name: 'launch name',
          startTime: 1540977815224,
          values: {
            statistics$executions$failed: '31',
            statistics$executions$passed: '12',
            statistics$executions$skipped: '11',
            statistics$executions$total: '21',
          },
        },
      ],
    },
  },
};
