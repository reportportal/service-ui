/*
 * Copyright 2025 EPAM Systems
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
  moveTestCaseTitle: {
    id: 'MoveTestCaseModal.title',
    defaultMessage: 'Move Test Case',
  },
  moveTestCaseDescription: {
    id: 'MoveTestCaseModal.description',
    defaultMessage: "You're about to move the test case <b>{testCaseName}</b> to a new folder",
  },
  moveTestCasesDescription: {
    id: 'MoveTestCaseModal.bulkDescription',
    defaultMessage:
      'You are about to move <b>{count}</b> selected test {count, plural, one {case} other {cases}} to a new location',
  },
  moveToFolder: {
    id: 'MoveTestCaseModal.moveToFolder',
    defaultMessage: 'Move to Folder',
  },
});
