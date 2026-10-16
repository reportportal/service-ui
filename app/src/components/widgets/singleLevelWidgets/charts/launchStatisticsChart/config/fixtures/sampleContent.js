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

export const PASSED_KEY = 'statistics$executions$passed';
export const FAILED_KEY = 'statistics$executions$failed';
export const SKIPPED_KEY = 'statistics$executions$skipped';

export const CONTENT_FIELDS = [PASSED_KEY, FAILED_KEY, SKIPPED_KEY];

export const DEFECT_TYPES = {};

export const sampleLaunchContent = [
  {
    id: 'launch-1',
    name: 'Demo Tests',
    number: '1',
    startTime: '1609459200000',
    values: {
      [PASSED_KEY]: '50',
      [FAILED_KEY]: '30',
      [SKIPPED_KEY]: '10',
    },
  },
  {
    id: 'launch-2',
    name: 'Demo Tests',
    number: '2',
    startTime: '1609545600000',
    values: {
      [PASSED_KEY]: '70',
      [FAILED_KEY]: '20',
      [SKIPPED_KEY]: '5',
    },
  },
  {
    id: 'launch-3',
    name: 'Demo Tests',
    number: '3',
    startTime: '1609632000000',
    values: {
      [PASSED_KEY]: '60',
      [FAILED_KEY]: '25',
      [SKIPPED_KEY]: '8',
    },
  },
];

export const sampleTimelineContent = {
  '2021-01-01': {
    values: {
      [PASSED_KEY]: '50',
      [FAILED_KEY]: '30',
      [SKIPPED_KEY]: '10',
    },
  },
  '2021-01-02': {
    values: {
      [PASSED_KEY]: '70',
      [FAILED_KEY]: '20',
      [SKIPPED_KEY]: '5',
    },
  },
};
