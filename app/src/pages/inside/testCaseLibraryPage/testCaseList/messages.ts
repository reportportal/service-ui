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
  searchPlaceholder: {
    id: 'TestCaseList.searchPlaceholder',
    defaultMessage: 'Search test cases...',
  },
  noResultsFilteredMessage: {
    id: 'TestCaseList.noResultsFilteredMessage',
    defaultMessage: 'No test cases found matching your criteria',
  },
  noResultsEmptyMessage: {
    id: 'TestCaseList.noResultsEmptyMessage',
    defaultMessage: 'No test cases available',
  },
  nameHeader: {
    id: 'TestCaseList.nameHeader',
    defaultMessage: 'Name',
  },
  executionHeader: {
    id: 'TestCaseList.executionHeader',
    defaultMessage: 'Last execution',
  },
  duplicate: {
    id: 'TestCaseList.duplicate',
    defaultMessage: 'Duplicate',
  },
  editTestCase: {
    id: 'TestCaseList.editTestCase',
    defaultMessage: 'Edit test case',
  },
  moveTestCaseTo: {
    id: 'TestCaseList.moveTestCaseTo',
    defaultMessage: 'Move test case to',
  },
  historyOfActions: {
    id: 'TestCaseList.historyOfActions',
    defaultMessage: 'History of actions',
  },
  deleteTestCase: {
    id: 'TestCaseList.deleteTestCase',
    defaultMessage: 'Delete test case',
  },
  addScenarioDetailsTooltip: {
    id: 'TestCaseList.addScenarioDetailsTooltip',
    defaultMessage: 'Add scenario details to be able to add this test case to launch',
  },
});
