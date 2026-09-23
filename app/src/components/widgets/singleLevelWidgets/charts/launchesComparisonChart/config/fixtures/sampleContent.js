/*
 * Copyright 2026 EPAM Systems
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

export const sampleContentFields = [
  'statistics$executions$total',
  'statistics$executions$passed',
  'statistics$executions$failed',
  'statistics$executions$skipped',
];

export const sampleContent = [
  {
    id: 'launch-1',
    name: 'Demo Tests',
    number: '1',
    startTime: '1609459200000',
    values: {
      statistics$executions$total: '100',
      statistics$executions$passed: '60',
      statistics$executions$failed: '40',
      statistics$executions$skipped: '0',
    },
  },
  {
    id: 'launch-2',
    name: 'Demo Tests',
    number: '2',
    startTime: '1609545600000',
    values: {
      statistics$executions$total: '100',
      statistics$executions$passed: '75',
      statistics$executions$failed: '15',
      statistics$executions$skipped: '10',
    },
  },
];
