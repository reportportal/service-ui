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

import type { MessageDescriptor } from 'react-intl';

import type { TmsMilestoneStatus } from 'controllers/milestone';

import { isBackToScheduledPopoverOption, MILESTONE_STATUS } from './milestoneStatus';
import { messages } from './milestonesTable/messages';

export const getMilestoneStatusMessageDescriptor = (
  status: TmsMilestoneStatus,
): MessageDescriptor => {
  switch (status) {
    case MILESTONE_STATUS.SCHEDULED:
      return messages.statusScheduled;
    case MILESTONE_STATUS.TESTING:
      return messages.statusTesting;
    case MILESTONE_STATUS.COMPLETED:
      return messages.statusCompleted;
    default:
      return messages.statusScheduled;
  }
};

export const getMilestoneStatusPopoverOptionMessageDescriptor = (
  option: TmsMilestoneStatus,
  current: TmsMilestoneStatus,
): MessageDescriptor => {
  if (isBackToScheduledPopoverOption(option, current)) {
    return messages.milestoneStatusBackToScheduled;
  }
  return getMilestoneStatusMessageDescriptor(option);
};
