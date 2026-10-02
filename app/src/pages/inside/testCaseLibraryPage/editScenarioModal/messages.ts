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
  readyScenarioHint: {
    id: 'EditScenarioModal.readyScenarioHint',
    defaultMessage:
      'Changing the scenario will set this Test Case to Draft and make its evaluation obsolete.',
  },
  approveWithChanges: {
    id: 'EditScenarioModal.approveWithChanges',
    defaultMessage: 'Approve along with these changes',
  },
  markReadyWithChanges: {
    id: 'EditScenarioModal.markReadyWithChanges',
    defaultMessage: 'Mark as ready along with these changes',
  },
  unsentCommentsHint: {
    id: 'EditScenarioModal.unsentCommentsHint',
    defaultMessage: 'Push or discard unsent comments before setting the Test Case to Ready.',
  },
  fixRunningHint: {
    id: 'EditScenarioModal.fixRunningHint',
    defaultMessage: 'The Test Case cannot be set to Ready while an agent fix is running.',
  },
});
