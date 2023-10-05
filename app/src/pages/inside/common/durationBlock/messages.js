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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  inProgressWithEnd: {
    id: 'DurationBlock.inProgressWithEnd',
    defaultMessage: "Wrong status: 'In progress' with finish time",
  },
  notInProgressWithoutEnd: {
    id: 'DurationBlock.notInProgressWithoutEnd',
    defaultMessage: "Wrong state: item is not 'In progress', but has no finish time",
  },
  inProgress: {
    id: 'DurationBlock.inProgress',
    defaultMessage: 'In progress',
  },
  skipped: {
    id: 'DurationBlock.skipped',
    defaultMessage: 'SKIPPED. Duration: { durationTime }',
  },
  stoppedDuration: {
    id: 'DurationBlock.stoppedDuration',
    defaultMessage: 'Run STOPPED after: { durationTime }.',
  },
  stoppedTime: {
    id: 'DurationBlock.stoppedTime',
    defaultMessage: 'Stopped at: { endTime }',
  },
  interruptedDuration: {
    id: 'DurationBlock.interruptedDuration',
    defaultMessage: 'Run INTERRUPTED after: { durationTime }.',
  },
  finishedDuration: {
    id: 'DurationBlock.finishedDuration',
    defaultMessage: 'Duration: { durationTime }.',
  },
  finishedTime: {
    id: 'DurationBlock.finishedTime',
    defaultMessage: 'Finish time: { endTime }',
  },
  overApproximate: {
    id: 'DurationBlock.overApproximate',
    defaultMessage: 'Average executions time - { end }, current overlap - { over }',
  },
  left: {
    id: 'DurationBlock.left',
    defaultMessage: 'left',
  },
  tooltipDescribe: {
    id: 'DurationTooltip.message',
    defaultMessage:
      'Duration is interval between first child starts and last child ends. But if child run in parallel, end time is a time of longest child, in this case duration will not be equal to child duration sum.',
  },
});
