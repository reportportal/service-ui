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

import { StageStatus } from 'types/aiFactory';

/**
 * Shared colour grouping for {@link StageStatusDot} and {@link StageStatusLabel}: `RUNNING` and
 * `IN_PROGRESS` are the same "active" colour, `PASSED` and `DONE` are the same "done" colour —
 * the two enum members exist because generation and automation stages use different vocabulary
 * (types/aiFactory.ts `StageStatus`).
 */
export const STAGE_STATUS_VARIANT: Record<StageStatus, string> = {
  [StageStatus.PENDING]: 'pending',
  [StageStatus.RUNNING]: 'active',
  [StageStatus.IN_PROGRESS]: 'active',
  [StageStatus.PASSED]: 'done',
  [StageStatus.DONE]: 'done',
  [StageStatus.FAILED]: 'failed',
  [StageStatus.SKIPPED]: 'skipped',
};
