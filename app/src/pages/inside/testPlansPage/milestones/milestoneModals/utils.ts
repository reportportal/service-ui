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

import { isSameDay, isValid, parseISO, startOfDay } from 'date-fns';

import { MilestoneStatus, type TmsMilestoneRS, type TmsMilestoneStatus } from 'controllers/milestone';

import { isoToDateOnlyFormValue } from '../milestoneDateUtils';
import { changeMilestoneStatusFlowType } from './changeMilestoneStatusModal/constants';
import type { ChangeMilestoneStatusFlow } from './changeMilestoneStatusModal/types';

const hasMeaningfulDateOnly = (iso: string): boolean => Boolean(isoToDateOnlyFormValue(iso).trim());

const isIsoOnLocalCalendarDay = (iso: string, day: Date): boolean => {
  const parsed = parseISO(iso);

  if (!isValid(parsed)) {
    return false;
  }

  return isSameDay(parsed, startOfDay(day));
};

export const getChangeMilestoneStatusFlow = (
  milestone: TmsMilestoneRS,
  targetStatus: TmsMilestoneStatus,
): ChangeMilestoneStatusFlow | null => {
  const current = milestone.status;

  if (targetStatus === MilestoneStatus.TESTING && current === MilestoneStatus.SCHEDULED) {
    if (!hasMeaningfulDateOnly(milestone.startDate)) {
      return { type: changeMilestoneStatusFlowType.START_TESTING_NO_START_DATE };
    }

    if (!isIsoOnLocalCalendarDay(milestone.startDate, new Date())) {
      return {
        type: changeMilestoneStatusFlowType.START_TESTING_DATE_CHOICE,
        startDateIso: milestone.startDate,
      };
    }

    return { type: changeMilestoneStatusFlowType.START_TESTING_SIMPLE };
  }

  if (
    targetStatus === MilestoneStatus.COMPLETED &&
    (current === MilestoneStatus.TESTING || current === MilestoneStatus.SCHEDULED)
  ) {
    if (!hasMeaningfulDateOnly(milestone.endDate)) {
      return { type: changeMilestoneStatusFlowType.COMPLETE_NO_DEADLINE };
    }

    if (!isIsoOnLocalCalendarDay(milestone.endDate, new Date())) {
      return {
        type: changeMilestoneStatusFlowType.COMPLETE_DATE_CHOICE,
        deadlineIso: milestone.endDate,
      };
    }

    return { type: changeMilestoneStatusFlowType.COMPLETE_SIMPLE };
  }

  if (targetStatus === MilestoneStatus.TESTING && current === MilestoneStatus.COMPLETED) {
    return { type: changeMilestoneStatusFlowType.BACK_TO_TESTING };
  }

  if (
    targetStatus === MilestoneStatus.SCHEDULED &&
    (current === MilestoneStatus.TESTING || current === MilestoneStatus.COMPLETED)
  ) {
    return { type: changeMilestoneStatusFlowType.BACK_TO_SCHEDULED };
  }

  return null;
};
