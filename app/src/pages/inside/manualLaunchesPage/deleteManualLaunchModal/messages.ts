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
  deleteLaunchTitle: {
    id: 'DeleteManualLaunchModal.deleteLaunchTitle',
    defaultMessage: 'Delete launch',
  },
  deleteConfirmation: {
    id: 'DeleteManualLaunchModal.deleteConfirmation',
    defaultMessage: "Are you sure you want to delete <b>{launchName}</b>?",
  },
  deletePermanentWarning: {
    id: 'DeleteManualLaunchModal.deletePermanentWarning',
    defaultMessage: 'This launch and all its test executions will be permanently deleted.',
  },
  batchDeleteTitle: {
    id: 'BatchDeleteManualLaunchesModal.title',
    defaultMessage: 'Delete launches',
  },
  batchDeleteDescription: {
    id: 'BatchDeleteManualLaunchesModal.description',
    defaultMessage:
      'Are you sure you want to delete {count} selected {count, plural, one {launch} other {launches}}?',
  },
});
