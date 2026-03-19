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

import type { StatusButtonConfig, StatusConfig } from './types';
import { EXECUTION_STATUSES } from '../manualLaunchDetailsPage/manualLaunchExecutions/types';

export const STATUS_BUTTONS: StatusButtonConfig[] = [
  { status: EXECUTION_STATUSES.SKIPPED, message: commonMessages.skipped },
  { status: EXECUTION_STATUSES.FAILED, message: commonMessages.failed },
  { status: EXECUTION_STATUSES.PASSED, message: commonMessages.passed },
];

export const STATUS_CONFIG: Record<EXECUTION_STATUSES, StatusConfig> = {
  [EXECUTION_STATUSES.PASSED]: {
    label: commonMessages.passed,
    colorClass: EXECUTION_STATUSES.PASSED.toLowerCase(),
  },
  [EXECUTION_STATUSES.FAILED]: {
    label: commonMessages.failed,
    colorClass: EXECUTION_STATUSES.FAILED.toLowerCase(),
  },
  [EXECUTION_STATUSES.SKIPPED]: {
    label: commonMessages.skipped,
    colorClass: EXECUTION_STATUSES.SKIPPED.toLowerCase(),
  },
  [EXECUTION_STATUSES.TO_RUN]: {
    label: commonMessages.toRun,
    colorClass: EXECUTION_STATUSES.TO_RUN.toLowerCase()
  }
};

export const EXECUTION_STATUS_CONFIRM_MODAL = 'executionStatusConfirmModal';
export const EXECUTION_STATUS_CONFIRM_FORM_NAME = 'executionStatusConfirmForm';
