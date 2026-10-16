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

export const sampleContent = [
  {
    id: 'item-1',
    name: 'slowTestA',
    duration: 0.81,
    status: 'FAILED',
    startTime: 1538474734721,
    path: '1.2.3',
  },
  {
    id: 'item-2',
    name: 'slowTestB',
    duration: 0.16,
    status: 'PASSED',
    startTime: 1538474726486,
    path: '1.2.4',
  },
  {
    id: 'item-3',
    name: 'slowTestC',
    duration: 0.1,
    status: 'SKIPPED',
    startTime: 1538474725654,
    path: '1.2.5',
  },
];

// 55 minutes in seconds → minutes time type after ms conversion
export const sampleContentLongMinutes = [
  {
    id: 'item-long',
    name: 'verySlowTest',
    duration: 55 * 60,
    status: 'PASSED',
    startTime: 1538474734721,
    path: '1.2.6',
  },
];
