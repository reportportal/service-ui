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
  'statistics$executions$passed',
  'statistics$executions$failed',
  'statistics$executions$skipped',
];

export const sampleContent = [
  {
    id: 'launch-1',
    values: {
      statistics$executions$passed: '60',
      statistics$executions$failed: '30',
      statistics$executions$skipped: '10',
    },
  },
];

export const sampleGetColumns = (content) => {
  const values = (content[0] || content).values;

  return {
    columns: Object.keys(values).map((key) => [key, Number(values[key])]),
    colors: {
      statistics$executions$passed: '#56b985',
      statistics$executions$failed: '#f65e5e',
      statistics$executions$skipped: '#6d6d6d',
    },
  };
};
