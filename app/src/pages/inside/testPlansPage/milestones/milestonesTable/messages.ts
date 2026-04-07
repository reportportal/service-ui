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

export const messages = defineMessages({
  coveredLabel: {
    id: 'MilestonesTable.coveredLabel',
    defaultMessage: 'Covered',
  },
  daysLeftLabel: {
    id: 'MilestonesTable.daysLeftLabel',
    defaultMessage: 'Days left',
  },
  plansLabel: {
    id: 'MilestonesTable.plansLabel',
    defaultMessage: 'Plans',
  },
  expandMilestone: {
    id: 'MilestonesTable.expandMilestone',
    defaultMessage: 'Expand milestone {name}',
  },
  milestoneActions: {
    id: 'MilestonesTable.milestoneActions',
    defaultMessage: 'Milestone actions',
  },
  placeholderExpanded: {
    id: 'MilestonesTable.placeholderExpanded',
    defaultMessage: 'Test plans will appear here in next task as well as empty state of it',
  },
  emptyTitle: {
    id: 'MilestonesTable.emptyTitle',
    defaultMessage: 'No Milestones created yet',
  },
  emptyDescription: {
    id: 'MilestonesTable.emptyDescription',
    defaultMessage:
      'Track your project progress by creating milestones. They group test plans and help measure coverage over time.',
  },
  statusScheduled: {
    id: 'MilestonesTable.statusScheduled',
    defaultMessage: 'Scheduled',
  },
  statusTesting: {
    id: 'MilestonesTable.statusTesting',
    defaultMessage: 'Testing',
  },
  statusCompleted: {
    id: 'MilestonesTable.statusCompleted',
    defaultMessage: 'Completed',
  },
  milestoneStatusBackToScheduled: {
    id: 'MilestonesTable.milestoneStatusBackToScheduled',
    defaultMessage: 'Back to Scheduled',
  },
  milestoneStatusBackToTesting: {
    id: 'MilestonesTable.milestoneStatusBackToTesting',
    defaultMessage: 'Back to Testing',
  },
  menuEditMilestone: {
    id: 'MilestonesTable.menuEditMilestone',
    defaultMessage: 'Edit milestone',
  },
  menuCreateTestPlan: {
    id: 'MilestonesTable.menuCreateTestPlan',
    defaultMessage: 'Create test plan',
  },
  menuDuplicateMilestone: {
    id: 'MilestonesTable.menuDuplicateMilestone',
    defaultMessage: 'Duplicate milestone',
  },
  menuDeleteMilestone: {
    id: 'MilestonesTable.menuDeleteMilestone',
    defaultMessage: 'Delete milestone',
  },
});
