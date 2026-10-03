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
  approve: {
    id: 'AiFactoryApproval.approve',
    defaultMessage: 'Approve',
  },
  markAsReady: {
    id: 'AiFactoryApproval.markAsReady',
    defaultMessage: 'Mark as ready',
  },
  approveAnyway: {
    id: 'AiFactoryApproval.approveAnyway',
    defaultMessage: 'Approve anyway',
  },
  obsoleteTitle: {
    id: 'AiFactoryApproval.obsoleteTitle',
    defaultMessage: 'Approve with an obsolete evaluation?',
  },
  obsoleteDescription: {
    id: 'AiFactoryApproval.obsoleteDescription',
    defaultMessage:
      'The scenario changed after the last evaluation. The displayed score may no longer describe this Test Case.',
  },
  unsentCommentsHint: {
    id: 'AiFactoryApproval.unsentCommentsHint',
    defaultMessage: 'Push or discard unsent comments before approving this Test Case.',
  },
  fixRunningHint: {
    id: 'AiFactoryApproval.fixRunningHint',
    defaultMessage: 'Wait for the current fix round to finish.',
  },
  approvedSuccess: {
    id: 'AiFactoryApproval.approvedSuccess',
    defaultMessage: 'Test Case has been approved and is now Ready.',
  },
  markedAsReadySuccess: {
    id: 'AiFactoryApproval.markedAsReadySuccess',
    defaultMessage: 'Test Case has been marked as Ready.',
  },
  updateFailed: {
    id: 'AiFactoryApproval.updateFailed',
    defaultMessage: 'Test Case status could not be updated. Try again.',
  },
  noLongerDraft: {
    id: 'AiFactoryApproval.noLongerDraft',
    defaultMessage: 'This Test Case is no longer Draft. Refresh the page and try again.',
  },
  noPermission: {
    id: 'AiFactoryApproval.noPermission',
    defaultMessage: 'You do not have permission to update this Test Case.',
  },
  bulkSuccess: {
    id: 'AiFactoryApproval.bulkSuccess',
    defaultMessage:
      '{count, plural, one {# Test Case is now Ready.} other {# Test Cases are now Ready.}}',
  },
  bulkSkipped: {
    id: 'AiFactoryApproval.bulkSkipped',
    defaultMessage: 'Skipped: {cases}',
  },
  skippedCase: {
    id: 'AiFactoryApproval.skippedCase',
    defaultMessage: '{id} — {reason}',
  },
  reasonAlreadyReady: {
    id: 'AiFactoryApproval.reasonAlreadyReady',
    defaultMessage: 'already Ready',
  },
  reasonFixRunning: {
    id: 'AiFactoryApproval.reasonFixRunning',
    defaultMessage: 'agent fix is running',
  },
  reasonUnsentComments: {
    id: 'AiFactoryApproval.reasonUnsentComments',
    defaultMessage: 'has unsent comments',
  },
  reasonNotReady: {
    id: 'AiFactoryApproval.reasonNotReady',
    defaultMessage: 'not eligible',
  },
  reasonAutomationInProgress: {
    id: 'AiFactoryApproval.reasonAutomationInProgress',
    defaultMessage: 'automation is in progress',
  },
});
