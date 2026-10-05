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

import { defineMessages, MessageDescriptor } from 'react-intl';

import { AiStageStatus, StageStatus } from 'types/aiFactory';

const messages = defineMessages({
  pending: {
    id: 'StageStatusLabel.pending',
    defaultMessage: 'Pending',
  },
  running: {
    id: 'StageStatusLabel.running',
    defaultMessage: 'Running',
  },
  inProgress: {
    id: 'StageStatusLabel.inProgress',
    defaultMessage: 'In progress',
  },
  passed: {
    id: 'StageStatusLabel.passed',
    defaultMessage: 'Passed',
  },
  done: {
    id: 'StageStatusLabel.done',
    defaultMessage: 'Done',
  },
  failed: {
    id: 'StageStatusLabel.failed',
    defaultMessage: 'Failed',
  },
  skipped: {
    id: 'StageStatusLabel.skipped',
    defaultMessage: 'Skipped',
  },
});

export const STAGE_STATUS_MESSAGE: Record<AiStageStatus, MessageDescriptor> = {
  [StageStatus.PENDING]: messages.pending,
  [StageStatus.RUNNING]: messages.running,
  [StageStatus.IN_PROGRESS]: messages.inProgress,
  [StageStatus.PASSED]: messages.passed,
  [StageStatus.DONE]: messages.done,
  [StageStatus.FAILED]: messages.failed,
  [StageStatus.SKIPPED]: messages.skipped,
};
