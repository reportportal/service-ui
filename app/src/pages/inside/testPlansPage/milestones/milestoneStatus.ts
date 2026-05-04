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

export function normalizeMilestoneStatus(status: string | undefined | null): TmsMilestoneStatus {
  const key = (status ?? MilestoneStatus.SCHEDULED).toString().toUpperCase();
  if (key === String(MilestoneStatus.TESTING)) return MilestoneStatus.TESTING;
  if (key === String(MilestoneStatus.COMPLETED)) return MilestoneStatus.COMPLETED;
  return MilestoneStatus.SCHEDULED;
}

export const milestoneStatusToCssModifier = (
  status: string | undefined | null,
): MilestoneCardStatusCssModifier => {
  const normalized = normalizeMilestoneStatus(status);
  if (normalized === MilestoneStatus.TESTING) return 'testing';
  if (normalized === MilestoneStatus.COMPLETED) return 'completed';
  return 'scheduled';
};

export const isBackToScheduledPopoverOption = (
  option: TmsMilestoneStatus,
  current: TmsMilestoneStatus,
): boolean => option === MilestoneStatus.SCHEDULED && current !== MilestoneStatus.SCHEDULED;

export const getMilestoneStatusPopoverOptions = (
  current: TmsMilestoneStatus,
): TmsMilestoneStatus[] => {
  switch (normalizeMilestoneStatus(current)) {
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

export const MILESTONE_STATUS_CHOOSE_EVENT_TYPE = {
  scheduled: 'scheduled',
  testing: 'testing',
  completed: 'completed',
  backToScheduled: 'back_to_scheduled',
  backToTesting: 'back_to_testing',
} as const;

export type MilestoneStatusDropdownChooseType =
  (typeof MILESTONE_STATUS_CHOOSE_EVENT_TYPE)[keyof typeof MILESTONE_STATUS_CHOOSE_EVENT_TYPE];

export const MILESTONE_CHANGE_STATUS_MODAL_BUTTON_ELEMENT_NAME = {
  change: 'change',
  completeMilestone: 'complete_milestone',
  completeWithToday: 'complete_with_today',
  completeWithoutDeadline: 'complete_without_deadline',
  completeWithoutReplacing: 'complete_without_replacing',
  startTesting: 'start_testing',
  startWithToday: 'start_with_today',
  startWithoutADate: 'start_without_a_date',
  startWithoutReplacing: 'start_without_replacing',
} as const;

export type MilestoneChangeStatusModalButtonElementName =
  (typeof MILESTONE_CHANGE_STATUS_MODAL_BUTTON_ELEMENT_NAME)[keyof typeof MILESTONE_CHANGE_STATUS_MODAL_BUTTON_ELEMENT_NAME];

export const getMilestoneStatusChooseEventType = (
  option: TmsMilestoneStatus,
  current: TmsMilestoneStatus,
): MilestoneStatusDropdownChooseType => {
  const normalizedOption = normalizeMilestoneStatus(option);
  const normalizedCurrent = normalizeMilestoneStatus(current);
  const opt = String(normalizedOption);
  const cur = String(normalizedCurrent);

  if (opt === String(MilestoneStatus.TESTING) && cur === String(MilestoneStatus.COMPLETED)) {
    return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.backToTesting;
  }
  if (isBackToScheduledPopoverOption(normalizedOption, normalizedCurrent)) {
    return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.backToScheduled;
  }
  if (opt === String(MilestoneStatus.SCHEDULED)) {
    return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.scheduled;
  }
  if (opt === String(MilestoneStatus.TESTING)) {
    return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.testing;
  }
  if (opt === String(MilestoneStatus.COMPLETED)) {
    return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.completed;
  }
  return MILESTONE_STATUS_CHOOSE_EVENT_TYPE.scheduled;
};
