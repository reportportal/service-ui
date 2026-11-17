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

export const changeMilestoneStatusModalMessages = defineMessages({
  startTestingTitle: {
    id: 'ChangeMilestoneStatusModal.startTestingTitle',
    defaultMessage: 'Start Testing',
  },
  startTestingSimpleBody: {
    id: 'ChangeMilestoneStatusModal.startTestingSimpleBody',
    defaultMessage: 'Are you sure you want to start testing the milestone <b>{name}</b>?',
  },
  startTestingReplaceBodyLead: {
    id: 'ChangeMilestoneStatusModal.startTestingReplaceBodyLead',
    defaultMessage:
      'You are start testing the milestone <b>{name}</b> which has a start date set to <b>{date}</b>.',
  },
  startTestingReplaceBodyFollowUp: {
    id: 'ChangeMilestoneStatusModal.startTestingReplaceBodyFollowUp',
    defaultMessage: 'Would you like to replace it with today\'s date?',
  },
  startTestingNoStartBodyLead: {
    id: 'ChangeMilestoneStatusModal.startTestingNoStartBodyLead',
    defaultMessage: 'You are start testing the milestone <b>{name}</b>.',
  },
  startTestingNoStartBodyFollowUp: {
    id: 'ChangeMilestoneStatusModal.startTestingNoStartBodyFollowUp',
    defaultMessage:
      'This milestone does not have a start date. Would you like to use today\'s date as the start date?',
  },
  startTestingPrimary: {
    id: 'ChangeMilestoneStatusModal.startTestingPrimary',
    defaultMessage: 'Start Testing',
  },
  startWithToday: {
    id: 'ChangeMilestoneStatusModal.startWithToday',
    defaultMessage: 'Start with Today',
  },
  startWithoutReplacing: {
    id: 'ChangeMilestoneStatusModal.startWithoutReplacing',
    defaultMessage: 'Start without Replacing',
  },
  startWithoutDate: {
    id: 'ChangeMilestoneStatusModal.startWithoutDate',
    defaultMessage: 'Start Without a Date',
  },
  completeMilestoneTitle: {
    id: 'ChangeMilestoneStatusModal.completeMilestoneTitle',
    defaultMessage: 'Complete Milestone',
  },
  completeSimpleBody: {
    id: 'ChangeMilestoneStatusModal.completeSimpleBody',
    defaultMessage: 'Are you sure you want to complete the milestone <b>{name}</b>?',
  },
  completeReplaceBodyLead: {
    id: 'ChangeMilestoneStatusModal.completeReplaceBodyLead',
    defaultMessage: 'Are you sure you want to complete the milestone <b>{name}</b>?',
  },
  completeReplaceBodyFollowUp: {
    id: 'ChangeMilestoneStatusModal.completeReplaceBodyFollowUp',
    defaultMessage:
      'This milestone also has a deadline set to <b>{date}</b>. Would you like to replace it with today\'s date?',
  },
  completeNoDeadlineBodyLead: {
    id: 'ChangeMilestoneStatusModal.completeNoDeadlineBodyLead',
    defaultMessage: 'Are you sure you want to complete the milestone <b>{name}</b>?',
  },
  completeNoDeadlineBodyFollowUp: {
    id: 'ChangeMilestoneStatusModal.completeNoDeadlineBodyFollowUp',
    defaultMessage:
      'This milestone does not have a deadline date. Would you like to use today\'s date as the deadline date?',
  },
  completeMilestonePrimary: {
    id: 'ChangeMilestoneStatusModal.completeMilestonePrimary',
    defaultMessage: 'Complete Milestone',
  },
  completeWithToday: {
    id: 'ChangeMilestoneStatusModal.completeWithToday',
    defaultMessage: 'Complete with Today',
  },
  completeWithoutReplacing: {
    id: 'ChangeMilestoneStatusModal.completeWithoutReplacing',
    defaultMessage: 'Complete without Replacing',
  },
  completeWithoutDeadline: {
    id: 'ChangeMilestoneStatusModal.completeWithoutDeadline',
    defaultMessage: 'Complete without Deadline',
  },
  backToTestingTitle: {
    id: 'ChangeMilestoneStatusModal.backToTestingTitle',
    defaultMessage: 'Back to Testing',
  },
  backToTestingBody: {
    id: 'ChangeMilestoneStatusModal.backToTestingBody',
    defaultMessage:
      'Are you sure you want to move the milestone <b>{name}</b> to the <b>{status}</b> status?',
  },
  backToScheduledTitle: {
    id: 'ChangeMilestoneStatusModal.backToScheduledTitle',
    defaultMessage: 'Back to Scheduled',
  },
  backToScheduledBody: {
    id: 'ChangeMilestoneStatusModal.backToScheduledBody',
    defaultMessage:
      'Are you sure you want to move the milestone <b>{name}</b> to the <b>{status}</b> status?',
  },
  adjustMilestoneToggle: {
    id: 'ChangeMilestoneStatusModal.adjustMilestoneToggle',
    defaultMessage: 'Adjust Milestone',
  },
  changeAction: {
    id: 'ChangeMilestoneStatusModal.changeAction',
    defaultMessage: 'Change',
  },
  dateShortcutToday: {
    id: 'ChangeMilestoneStatusModal.dateShortcutToday',
    defaultMessage: 'Today',
  },
});
