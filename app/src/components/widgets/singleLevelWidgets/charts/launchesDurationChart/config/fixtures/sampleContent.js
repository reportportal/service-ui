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
    duration: '4607',
    startTime: '1538474734721',
    endTime: '1538474739328',
    status: 'STOPPED',
    name: 'Demo Api Tests__ncst',
    number: '6',
    id: '5bb342ee0274390001975997',
  },
  {
    duration: '1526',
    startTime: '1538474726486',
    endTime: '1538474728012',
    status: 'FAILED',
    name: 'Demo Api Tests__ncst',
    number: '3',
    id: '5bb342e60274390001974193',
  },
  {
    duration: '830',
    startTime: '1538474725654',
    endTime: '1538474726485',
    status: 'PASSED',
    name: 'Demo Api Tests__ncst',
    number: '2',
    id: '5bb342e50274390001973f69',
  },
];

export const sampleContentWithInterrupted = [
  ...sampleContent.slice(0, 2),
  {
    duration: '830',
    startTime: '1538474725654',
    endTime: '1538474726485',
    status: 'INTERRUPTED',
    name: 'Demo Api Tests__ncst',
    number: '2',
    id: '5bb342e50274390001973f69',
  },
];

// 55 minutes → minutes time type; fixed 0.5-unit step would produce ~110 ticks
export const sampleContentLongMinutes = [
  {
    duration: String(55 * 60 * 1000),
    startTime: '1538474734721',
    endTime: '1538478034721',
    status: 'PASSED',
    name: 'Demo Api Tests__ncst',
    number: '10',
    id: '5bb342ee0274390001975998',
  },
];
