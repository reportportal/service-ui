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
  'statistics$defects$product_bug$total',
  'statistics$defects$automation_bug$total',
];

export const sampleContent = [
  {
    attributeValue: 'build-1',
    content: {
      tooltipContent: 'Build 1',
      statistics: {
        statistics$executions$total: '10',
        statistics$executions$passed: '6',
        statistics$executions$failed: '3',
        statistics$executions$skipped: '1',
        statistics$defects$product_bug$total: '2',
        statistics$defects$automation_bug$total: '1',
      },
    },
  },
  {
    attributeValue: 'build-2',
    content: {
      tooltipContent: 'Build 2',
      statistics: {
        statistics$executions$total: '20',
        statistics$executions$passed: '15',
        statistics$executions$failed: '5',
        statistics$executions$skipped: '0',
        statistics$defects$product_bug$total: '3',
        statistics$defects$automation_bug$total: '2',
      },
    },
  },
];
