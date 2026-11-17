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
    defaultMessage: 'Delete Launch',
  },
  deleteConfirmation: {
    id: 'DeleteManualLaunchModal.deleteConfirmation',
    defaultMessage: "Are you sure you want to delete the launch <b>{launchName}</b>?",
  },
  deletePermanentWarning: {
    id: 'DeleteManualLaunchModal.deletePermanentWarning',
    defaultMessage: 'This irreversible action will remove all its test executions and may impact the coverage of the test plans to which it is linked.',
  },
  batchDeleteTitle: {
    id: 'BatchDeleteManualLaunchesModal.title',
    defaultMessage: 'Delete Launches',
  },
  batchDeleteDescription: {
    id: 'BatchDeleteManualLaunchesModal.description',
    defaultMessage:
      'Are you sure you want to delete <b>{count}</b> selected {count, plural, one {launch} other {launches}}?',
  },
});
