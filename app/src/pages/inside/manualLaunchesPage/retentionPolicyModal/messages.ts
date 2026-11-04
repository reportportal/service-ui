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
  markAsImportantAction: {
    id: 'ManualLaunchRetentionPolicyModal.markAsImportantAction',
    defaultMessage: 'Mark as Important',
  },
  unmarkAsImportantAction: {
    id: 'ManualLaunchRetentionPolicyModal.unmarkAsImportantAction',
    defaultMessage: 'Unmark as Important',
  },
  importantLaunchTooltip: {
    id: 'ManualLaunchRetentionPolicyModal.importantLaunchTooltip',
    defaultMessage:
      'This is an Important launch. It follows a separate retention policy for Important launches.',
  },
  markAsImportantTitle: {
    id: 'ManualLaunchRetentionPolicyModal.markAsImportantTitle',
    defaultMessage: 'Mark As Important',
  },
  markAsImportantDescription: {
    id: 'ManualLaunchRetentionPolicyModal.markAsImportantDescription',
    defaultMessage:
      'This launch will be marked as Important and retained according to the Important Launch retention policy, but it can still be deleted manually.',
  },
  unmarkAsImportantTitle: {
    id: 'ManualLaunchRetentionPolicyModal.unmarkAsImportantTitle',
    defaultMessage: 'Unmark As Important',
  },
  unmarkAsImportantDescription: {
    id: 'ManualLaunchRetentionPolicyModal.unmarkAsImportantDescription',
    defaultMessage:
      'Are you sure you want to unmark the important attribute from this launch? In the future, this launch will be processed by the standard retention policy.',
  },
  unmark: {
    id: 'ManualLaunchRetentionPolicyModal.unmark',
    defaultMessage: 'Unmark',
  },
  launchUpdatedSuccess: {
    id: 'ManualLaunchRetentionPolicyModal.launchUpdatedSuccess',
    defaultMessage: 'Launch has been updated successfully',
  },
  launchUpdateFailed: {
    id: 'ManualLaunchRetentionPolicyModal.launchUpdateFailed',
    defaultMessage: 'Failed to update the launch',
  },
});
