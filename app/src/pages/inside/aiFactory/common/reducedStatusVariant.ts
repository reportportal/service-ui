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

import type { ReducedPipelineStatus } from 'controllers/aiFactory/pipelines';

export type ReducedStatusVariant =
  | 'pending'
  | 'active'
  | 'waiting'
  | 'done'
  | 'failed'
  | 'skipped'
  | 'unknown';

const STATUS_VARIANT: Record<ReducedPipelineStatus, ReducedStatusVariant> = {
  PENDING: 'pending',
  RUNNING: 'active',
  WAITING: 'waiting',
  PASSED: 'done',
  FAILED: 'failed',
  NEEDS_HUMAN: 'waiting',
  SKIPPED: 'skipped',
  UNKNOWN: 'unknown',
};

export const getReducedStatusVariant = (status: ReducedPipelineStatus): ReducedStatusVariant =>
  STATUS_VARIANT[status];
