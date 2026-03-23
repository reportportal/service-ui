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

import { MilestoneStatus as MILESTONE_STATUS } from 'controllers/milestone';
import type { TmsMilestoneStatus } from 'controllers/milestone';

export { MILESTONE_STATUS };

export type MilestoneCardStatusCssModifier = 'scheduled' | 'testing' | 'completed';

export const milestoneStatusToCssModifier = (
  status: string | undefined | null,
): MilestoneCardStatusCssModifier => {
  const key = (status ?? MILESTONE_STATUS.SCHEDULED).toString().toUpperCase();
  if (key === String(MILESTONE_STATUS.TESTING)) return 'testing';
  if (key === String(MILESTONE_STATUS.COMPLETED)) return 'completed';
  return 'scheduled';
};

export const isBackToScheduledPopoverOption = (
  option: TmsMilestoneStatus,
  current: TmsMilestoneStatus,
): boolean => option === MILESTONE_STATUS.SCHEDULED && current !== MILESTONE_STATUS.SCHEDULED;

export const getMilestoneStatusPopoverOptions = (
  current: TmsMilestoneStatus,
): TmsMilestoneStatus[] => {
  switch (current) {
    case MILESTONE_STATUS.SCHEDULED:
      return [MILESTONE_STATUS.TESTING, MILESTONE_STATUS.COMPLETED];
    case MILESTONE_STATUS.TESTING:
      return [MILESTONE_STATUS.COMPLETED, MILESTONE_STATUS.SCHEDULED];
    case MILESTONE_STATUS.COMPLETED:
      return [MILESTONE_STATUS.TESTING, MILESTONE_STATUS.SCHEDULED];
    default:
      return [MILESTONE_STATUS.TESTING, MILESTONE_STATUS.COMPLETED];
  }
};
