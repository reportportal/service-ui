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

import type { StatusButtonConfig } from './types';

export const EXECUTION_STATUS_SKIPPED = 'skipped' as const;
export const EXECUTION_STATUS_FAILED = 'failed' as const;
export const EXECUTION_STATUS_PASSED = 'passed' as const;

export const STATUS_BUTTONS: StatusButtonConfig[] = [
  { status: EXECUTION_STATUS_SKIPPED, message: commonMessages.skipped },
  { status: EXECUTION_STATUS_FAILED, message: commonMessages.failed },
  { status: EXECUTION_STATUS_PASSED, message: commonMessages.passed },
];
