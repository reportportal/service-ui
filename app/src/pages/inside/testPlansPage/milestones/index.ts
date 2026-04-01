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

export { MilestonesTable, EmptyMilestones } from './milestonesTable';
export {
  useCreateMilestoneModal,
  useEditMilestoneModal,
  useDuplicateMilestoneModal,
} from './milestoneModals';

export { MilestoneDateField } from './milestoneDateField/milestoneDateField';
export type { MilestoneDateFieldProps } from './milestoneDateField/types';
export { MilestoneDateShortcutRow } from './milestoneDateShortcutRow/milestoneDateShortcutRow';
export type {
  MilestoneDateShortcutItem,
  MilestoneDateShortcutRowProps,
} from './milestoneDateShortcutRow/types';
export { MilestoneTypeDropdown } from './milestoneTypeDropdown/milestoneTypeDropdown';

export {
  tomorrowDateOnly,
  nextMondayDateOnly,
  endDateDaysAfterStart,
  endDateMonthsAfterStart,
} from './datePickerConstants';
export {
  parseDateOnly,
  toDateOnlyString,
  dateOnlyStringToUtcIso,
  formatIsoDateShort,
} from './milestoneDateUtils';

export { MilestoneType, MilestoneStatus } from 'controllers/milestone';

export {
  MILESTONE_STATUS,
  isBackToScheduledPopoverOption,
  milestoneStatusToCssModifier,
  getMilestoneStatusPopoverOptions,
} from './milestoneStatus';
export type { MilestoneCardStatusCssModifier } from './milestoneStatus';
export {
  getMilestoneStatusMessageDescriptor,
  getMilestoneStatusPopoverOptionMessageDescriptor,
} from './milestoneStatusMessages';
