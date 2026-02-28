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
  executionId: {
    id: 'ExecutionSidePanel.executionId',
    defaultMessage: 'ID',
  },
  linkedToBTS: {
    id: 'ExecutionSidePanel.linkedToBTS',
    defaultMessage: 'Linked to BTS',
  },
  executionComment: {
    id: 'ExecutionSidePanel.executionComment',
    defaultMessage: 'Execution Comment',
  },
  changeStatus: {
    id: 'ExecutionSidePanel.changeStatus',
    defaultMessage: 'Change Status',
  },
  runTest: {
    id: 'ExecutionSidePanel.runTest',
    defaultMessage: 'Run Test',
  },
});
