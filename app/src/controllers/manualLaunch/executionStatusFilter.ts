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

import { ExecutionStatus } from 'types/testCase';

export const MANUAL_LAUNCH_FILTER_EXECUTION_STATUSES = [
  ExecutionStatus.TO_RUN,
  ExecutionStatus.IN_PROGRESS,
  ExecutionStatus.PASSED,
  ExecutionStatus.FAILED,
  ExecutionStatus.SKIPPED,
] as const;

export type ManualLaunchFilterExecutionStatus =
  (typeof MANUAL_LAUNCH_FILTER_EXECUTION_STATUSES)[number];

export const parseExecutionStatusFilter = (
  raw?: string | null,
): ManualLaunchFilterExecutionStatus[] => {
  if (!raw) {
    return [];
  }

  const requested = new Set(raw.split(',').map((status) => status.trim().toUpperCase()));

  return MANUAL_LAUNCH_FILTER_EXECUTION_STATUSES.filter((status) => requested.has(status));
};

export const serializeExecutionStatusFilter = (statuses: readonly string[]): string | undefined => {
  const normalized = parseExecutionStatusFilter(statuses.join(','));

  return normalized.length ? normalized.join(',') : undefined;
};

export const normalizeExecutionStatusFilter = (raw?: string | null): string | undefined =>
  serializeExecutionStatusFilter(parseExecutionStatusFilter(raw));
