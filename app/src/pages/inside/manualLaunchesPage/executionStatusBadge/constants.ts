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

import type { MessageDescriptor } from 'react-intl';

import { commonMessages } from 'pages/inside/common/common-messages';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';

export const EXECUTION_STATUS_BADGE_LABELS: Partial<Record<ExecutionStatus, MessageDescriptor>> = {
  [ExecutionStatus.TO_RUN]: commonMessages.toRun,
  [ExecutionStatus.IN_PROGRESS]: commonMessages.inProgress,
  [ExecutionStatus.PASSED]: commonMessages.passed,
  [ExecutionStatus.FAILED]: commonMessages.failed,
  [ExecutionStatus.SKIPPED]: commonMessages.skipped,
};

export const EXECUTION_STATUS_BADGE_DOTS: Partial<Record<ExecutionStatus, string>> = {
  [ExecutionStatus.PASSED]: 'passed',
  [ExecutionStatus.FAILED]: 'failed',
  [ExecutionStatus.SKIPPED]: 'skipped',
};
