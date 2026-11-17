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

export const createMilestoneModalMessages = defineMessages({
  createMilestoneModalTitle: {
    id: 'MilestonesTable.createMilestoneModalTitle',
    defaultMessage: 'Create Milestone',
  },
  milestoneNamePlaceholder: {
    id: 'MilestonesTable.milestoneNamePlaceholder',
    defaultMessage: 'Enter milestone name',
  },
  typeLabel: {
    id: 'MilestonesTable.typeLabel',
    defaultMessage: 'Type',
  },
  selectMilestoneTypePlaceholder: {
    id: 'MilestonesTable.selectMilestoneTypePlaceholder',
    defaultMessage: 'Select milestone type',
  },
  milestoneTypeRelease: {
    id: 'MilestonesTable.milestoneTypeRelease',
    defaultMessage: 'Release',
  },
  milestoneTypeReleaseDesc: {
    id: 'MilestonesTable.milestoneTypeReleaseDesc',
    defaultMessage: 'Major software version delivery milestone',
  },
  milestoneTypeSprint: {
    id: 'MilestonesTable.milestoneTypeSprint',
    defaultMessage: 'Sprint',
  },
  milestoneTypeSprintDesc: {
    id: 'MilestonesTable.milestoneTypeSprintDesc',
    defaultMessage: 'Repeatable development cycle',
  },
  milestoneTypePlan: {
    id: 'MilestonesTable.milestoneTypePlan',
    defaultMessage: 'Plan',
  },
  milestoneTypePlanDesc: {
    id: 'MilestonesTable.milestoneTypePlanDesc',
    defaultMessage: 'Strategic roadmap for testing',
  },
  milestoneTypeFeature: {
    id: 'MilestonesTable.milestoneTypeFeature',
    defaultMessage: 'Feature',
  },
  milestoneTypeFeatureDesc: {
    id: 'MilestonesTable.milestoneTypeFeatureDesc',
    defaultMessage: 'Milestone focused on a specific functionality',
  },
  milestoneTypeOther: {
    id: 'MilestonesTable.milestoneTypeOther',
    defaultMessage: 'Other',
  },
  milestoneTypeOtherDesc: {
    id: 'MilestonesTable.milestoneTypeOtherDesc',
    defaultMessage: 'Custom milestones for unique project needs',
  },
  startDateLabel: {
    id: 'MilestonesTable.startDateLabel',
    defaultMessage: 'Start date',
  },
  endDateLabel: {
    id: 'MilestonesTable.endDateLabel',
    defaultMessage: 'Deadline',
  },
  dateFieldPlaceholder: {
    id: 'MilestonesTable.dateFieldPlaceholder',
    defaultMessage: 'MM-DD-YYYY',
  },
  dateShortcutTomorrow: {
    id: 'MilestonesTable.dateShortcutTomorrow',
    defaultMessage: 'Tomorrow',
  },
  dateShortcutNextMonday: {
    id: 'MilestonesTable.dateShortcutNextMonday',
    defaultMessage: 'Next Monday',
  },
  dateShortcutWeek: {
    id: 'MilestonesTable.dateShortcutWeek',
    defaultMessage: 'Week',
  },
  dateShortcutTwoWeeks: {
    id: 'MilestonesTable.dateShortcutTwoWeeks',
    defaultMessage: '2 weeks',
  },
  dateShortcutOneMonth: {
    id: 'MilestonesTable.dateShortcutOneMonth',
    defaultMessage: '1 month',
  },
  editMilestoneModalTitle: {
    id: 'MilestonesTable.editMilestoneModalTitle',
    defaultMessage: 'Edit Milestone',
  },
  saveMilestoneChanges: {
    id: 'MilestonesTable.saveMilestoneChanges',
    defaultMessage: 'Save changes',
  },
  duplicateMilestoneModalTitle: {
    id: 'MilestonesTable.duplicateMilestoneModalTitle',
    defaultMessage: 'Duplicate Milestone',
  },
  duplicateMilestoneInfoTitle: {
    id: 'MilestonesTable.duplicateMilestoneInfoTitle',
    defaultMessage: 'Test progress and coverage statistics cannot be duplicated',
  },
  duplicateMilestoneInfoBody: {
    id: 'MilestonesTable.duplicateMilestoneInfoBody',
    defaultMessage:
      'Only the structure of the test plans, test cases, and their settings will be copied. Please be cautious when duplicating test plan attributes, as they may affect statistics and future filtering.',
  },
});
