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
  requirements: {
    id: 'ManualLaunchExecutionPage.requirements',
    defaultMessage: 'Requirements',
  },
  requirementsAreNotSpecified: {
    id: 'ManualLaunchExecutionPage.requirementsAreNotSpecified',
    defaultMessage: 'Requirements are not specified',
  },
  preconditionIsNotSpecified: {
    id: 'ManualLaunchExecutionPage.preconditionIsNotSpecified',
    defaultMessage: 'Precondition is not specified',
  },
  noStepsSpecified: {
    id: 'ManualLaunchExecutionPage.noStepsSpecified',
    defaultMessage: 'No steps specified',
  },
  noDetailsForScenario: {
    id: 'ManualLaunchExecutionPage.noDetailsForScenario',
    defaultMessage: 'No details for this scenario',
  },
  executionNotFound: {
    id: 'ManualLaunchExecutionPage.executionNotFound',
    defaultMessage: 'Execution not found',
  },
  noAttachments: {
    id: 'ManualLaunchExecutionPage.noAttachments',
    defaultMessage: 'No attachments added',
  },
  executionStatusUpdated: {
    id: 'ManualLaunchExecutionPage.executionStatusUpdated',
    defaultMessage: 'Execution status updated to {status}',
  },
  executionCommentTitle: {
    id: 'ManualLaunchExecutionPage.executionCommentTitle',
    defaultMessage: 'Execution comment',
  },
  clearExecutionComment: {
    id: 'ManualLaunchExecutionPage.clearExecutionComment',
    defaultMessage: 'Clear comment',
  },
  saveExecutionComment: {
    id: 'ManualLaunchExecutionPage.saveExecutionComment',
    defaultMessage: 'Save',
  },
  removeAttachment: {
    id: 'ManualLaunchExecutionPage.removeAttachment',
    defaultMessage: 'Remove attachment',
  },
  clearStatus: {
    id: 'ExecutionStatusPopover.clearStatus',
    defaultMessage: 'Clear status',
  },
});
