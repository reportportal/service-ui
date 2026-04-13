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

import type { ManualLaunchesFilterPayload } from './types';

export const LAUNCH_STATUSES = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const;

export const COMPLETION_VALUES = {
  ALL: 'all',
  HAS_NOT_EXECUTED_TESTS: 'hasNotExecutedTests',
  DONE: 'done',
} as const;

export const START_TIME_PRESETS = {
  TODAY: 'today',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_90_DAYS: 'last90days',
} as const;

export const DAYS_IN_WEEK = 7;
export const DAYS_IN_MONTH = 30;
export const DAYS_IN_QUARTER = 90;

export const END_OF_DAY_HOURS = 23;
export const END_OF_DAY_MINUTES = 59;
export const END_OF_DAY_SECONDS = 59;
export const END_OF_DAY_MS = 999;

export const EMPTY_FILTER: ManualLaunchesFilterPayload = {
  statuses: [],
  completion: COMPLETION_VALUES.ALL,
  startTime: null,
  testPlan: null,
  attributes: [],
};
