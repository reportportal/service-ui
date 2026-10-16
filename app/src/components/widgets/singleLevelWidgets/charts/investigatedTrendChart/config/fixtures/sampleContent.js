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

export const sampleLaunchContent = [
  {
    id: 'launch-1',
    name: 'Demo Tests',
    number: '1',
    startTime: '1609459200000',
    values: {
      investigated: '60',
      toInvestigate: '40',
    },
  },
  {
    id: 'launch-2',
    name: 'Demo Tests',
    number: '2',
    startTime: '1609545600000',
    values: {
      investigated: '75',
      toInvestigate: '25',
    },
  },
  {
    id: 'launch-3',
    name: 'Demo Tests',
    number: '3',
    startTime: '1609632000000',
    values: {
      investigated: '50',
      toInvestigate: '50',
    },
  },
];

export const sampleTimelineContent = {
  '2021-01-01': {
    values: {
      investigated: '55',
      toInvestigate: '45',
    },
  },
  '2021-01-02': {
    values: {
      investigated: '70',
      toInvestigate: '30',
    },
  },
};

export const sampleStatusPageContent = [
  {
    name: 'Jan 1 - Jan 7',
    values: {
      investigated: '65',
      toInvestigate: '35',
    },
  },
  {
    name: 'Jan 8 - Jan 14',
    values: {
      investigated: '80',
      toInvestigate: '20',
    },
  },
  {
    name: 'Jan 15 - Jan 21',
    values: {
      investigated: '40',
      toInvestigate: '60',
    },
  },
  {
    name: 'Jan 22 - Jan 28',
    values: {
      investigated: '90',
      toInvestigate: '10',
    },
  },
];
