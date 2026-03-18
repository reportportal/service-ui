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

import { commonMessages } from 'pages/inside/common/common-messages';

import type { StatusButtonConfig, StatusConfig, ExecutionStatusType } from './types';

export const EXECUTION_STATUS_TO_RUN = 'TO_RUN' as const;
export const EXECUTION_STATUS_SKIPPED: ExecutionStatusType = 'skipped';
export const EXECUTION_STATUS_FAILED: ExecutionStatusType = 'failed';
export const EXECUTION_STATUS_PASSED: ExecutionStatusType = 'passed';

export const STATUS_BUTTONS: StatusButtonConfig[] = [
  { status: EXECUTION_STATUS_SKIPPED, message: commonMessages.skipped },
  { status: EXECUTION_STATUS_FAILED, message: commonMessages.failed },
  { status: EXECUTION_STATUS_PASSED, message: commonMessages.passed },
];

export const STATUS_CONFIG: Record<ExecutionStatusType, StatusConfig> = {
  [EXECUTION_STATUS_PASSED]: {
    label: commonMessages.passed,
    colorClass: EXECUTION_STATUS_PASSED,
  },
  [EXECUTION_STATUS_FAILED]: {
    label: commonMessages.failed,
    colorClass: EXECUTION_STATUS_FAILED,
  },
  [EXECUTION_STATUS_SKIPPED]: {
    label: commonMessages.skipped,
    colorClass: EXECUTION_STATUS_SKIPPED,
  },
};

export const EXECUTION_STATUS_CONFIRM_MODAL = 'executionStatusConfirmModal';
export const EXECUTION_STATUS_CONFIRM_FORM_NAME = 'executionStatusConfirmForm';
