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

import type { TmsMilestoneRS, TmsMilestoneStatus } from 'controllers/milestone';

import { changeMilestoneStatusFlowType } from './constants';

export type ChangeMilestoneStatusModalData = {
  milestone: TmsMilestoneRS;
  targetStatus: TmsMilestoneStatus;
};

export interface ChangeMilestoneStatusModalProps {
  data: ChangeMilestoneStatusModalData | null | undefined;
}

export type ChangeMilestoneStatusFlow =
  | { type: typeof changeMilestoneStatusFlowType.START_TESTING_SIMPLE }
  | { type: typeof changeMilestoneStatusFlowType.START_TESTING_DATE_CHOICE; startDateIso: string }
  | { type: typeof changeMilestoneStatusFlowType.START_TESTING_NO_START_DATE }
  | { type: typeof changeMilestoneStatusFlowType.COMPLETE_SIMPLE }
  | { type: typeof changeMilestoneStatusFlowType.COMPLETE_DATE_CHOICE; deadlineIso: string }
  | { type: typeof changeMilestoneStatusFlowType.COMPLETE_NO_DEADLINE }
  | { type: typeof changeMilestoneStatusFlowType.BACK_TO_TESTING }
  | { type: typeof changeMilestoneStatusFlowType.BACK_TO_SCHEDULED };

export type MilestoneAdjustFormValues = {
  type: string;
  startDate: string;
  endDate: string;
};

export type ChangeMilestoneStatusSuccessMessageId =
  | 'milestoneTestingStartedSuccess'
  | 'milestoneCompletedSuccess'
  | 'milestoneStatusChangedToTestingSuccess'
  | 'milestoneStatusChangedToScheduledSuccess';

export type MilestoneStatusPatchBody = {
  name: string;
  type: TmsMilestoneRS['type'];
  status: TmsMilestoneStatus;
  startDate: string | null;
  endDate: string | null;
};
