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

import { MilestoneStatus } from 'controllers/milestone';
import type { TmsMilestoneStatus } from 'controllers/milestone';

export { MilestoneStatus as MILESTONE_STATUS } from 'controllers/milestone';

export type MilestoneCardStatusCssModifier = 'scheduled' | 'testing' | 'completed';

export const milestoneStatusToCssModifier = (
  status: string | undefined | null,
): MilestoneCardStatusCssModifier => {
  const key = (status ?? MilestoneStatus.SCHEDULED).toString().toUpperCase();
  if (key === String(MilestoneStatus.TESTING)) return 'testing';
  if (key === String(MilestoneStatus.COMPLETED)) return 'completed';
  return 'scheduled';
};

export const isBackToScheduledPopoverOption = (
  option: TmsMilestoneStatus,
  current: TmsMilestoneStatus,
): boolean => option === MilestoneStatus.SCHEDULED && current !== MilestoneStatus.SCHEDULED;

export const getMilestoneStatusPopoverOptions = (
  current: TmsMilestoneStatus,
): TmsMilestoneStatus[] => {
  switch (current) {
    case MilestoneStatus.SCHEDULED:
      return [MilestoneStatus.TESTING, MilestoneStatus.COMPLETED];
    case MilestoneStatus.TESTING:
      return [MilestoneStatus.COMPLETED, MilestoneStatus.SCHEDULED];
    case MilestoneStatus.COMPLETED:
      return [MilestoneStatus.TESTING, MilestoneStatus.SCHEDULED];
    default:
      return [MilestoneStatus.TESTING, MilestoneStatus.COMPLETED];
  }
};
