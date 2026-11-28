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

import { defineMessages } from 'react-intl';

export const milestoneAutomaticStatusMessages = defineMessages({
  title: {
    id: 'MilestoneAutomaticStatus.title',
    defaultMessage: 'Automatic status',
  },
  startOnStartDate: {
    id: 'MilestoneAutomaticStatus.startOnStartDate',
    defaultMessage: 'Start on the start date',
  },
  startOnStartDateHelper: {
    id: 'MilestoneAutomaticStatus.startOnStartDateHelper',
    defaultMessage: 'The status changes to Testing on the start date.',
  },
  startOnFirstExecution: {
    id: 'MilestoneAutomaticStatus.startOnFirstExecution',
    defaultMessage: 'Start with the first execution',
  },
  startOnFirstExecutionHelper: {
    id: 'MilestoneAutomaticStatus.startOnFirstExecutionHelper',
    defaultMessage:
      'The status changes to Testing when the first test in any of its Test Plans is executed.',
  },
  completeAfterDeadline: {
    id: 'MilestoneAutomaticStatus.completeAfterDeadline',
    defaultMessage: 'Complete after the deadline',
  },
  completeAfterDeadlineHelper: {
    id: 'MilestoneAutomaticStatus.completeAfterDeadlineHelper',
    defaultMessage: 'The status changes to Completed when the deadline day is over.',
  },
});
