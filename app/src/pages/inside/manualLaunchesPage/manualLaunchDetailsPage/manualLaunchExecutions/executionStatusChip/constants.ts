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

import ToRunIcon from 'common/img/execution-status/to-run-inline.svg';
import PassedIcon from 'common/img/execution-status/passed-inline.svg';
import InProgressIcon from 'common/img/execution-status/in-progress-inline.svg';
import FailedIcon from 'common/img/execution-status/failed-inline.svg';

import { ExecutionStatus } from './types';

export const STATUS_CLASS_MAP: Record<ExecutionStatus, string> = {
  [ExecutionStatus.TO_RUN]: 'to-run',
  [ExecutionStatus.IN_PROGRESS]: 'in-progress',
  [ExecutionStatus.PASSED]: 'passed',
  [ExecutionStatus.FAILED]: 'failed',
};

export const STATUS_ICON_MAP: Record<ExecutionStatus, string> = {
  [ExecutionStatus.TO_RUN]: ToRunIcon as unknown as string,
  [ExecutionStatus.IN_PROGRESS]: InProgressIcon as unknown as string,
  [ExecutionStatus.PASSED]: PassedIcon as unknown as string,
  [ExecutionStatus.FAILED]: FailedIcon as unknown as string,
};
