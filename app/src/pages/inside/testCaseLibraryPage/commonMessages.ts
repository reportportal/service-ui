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

import { defineMessages, MessageDescriptor } from 'react-intl';

export const commonMessages: Record<string, MessageDescriptor> = defineMessages({
  testCaseLibraryHeader: {
    id: 'TestCaseLibraryPage.testCaseLibraryHeader',
    defaultMessage: 'Test Case Library',
  },
  createTestCase: {
    id: 'TestCaseLibraryPage.createTestCase',
    defaultMessage: 'Create Test Case',
  },
  createFolder: {
    id: 'TestCaseLibraryPage.createFolder',
    defaultMessage: 'Create Folder',
  },
  importTestCases: {
    id: 'TestCaseLibraryPage.importTestCases',
    defaultMessage: 'Import Test Cases',
  },
  testCaseLibraryBreadcrumb: {
    id: 'TestCaseLibraryPage.testCaseLibraryBreadcrumb',
    defaultMessage: 'Test Case Library',
  },
  historyOfActions: {
    id: 'TestCaseLibraryPage.historyOfActions',
    defaultMessage: 'History of actions',
  },
  loadingFolders: {
    id: 'TestCaseLibraryPage.loadingFolders',
    defaultMessage: 'Loading folders...',
  },
  deleteFolder: {
    id: 'TestCaseLibraryPage.deleteFolder',
    defaultMessage: 'Delete folder',
  },
  duplicateFolder: {
    id: 'TestCaseLibraryPage.duplicateFolder',
    defaultMessage: 'Duplicate folder',
  },
  enterFolderName: {
    id: 'TestCaseLibraryPage.enterFolderName',
    defaultMessage: 'Enter folder name',
  },
  testCaseName: {
    id: 'TestCaseLibraryPage.testCaseName',
    defaultMessage: 'Test case name',
  },
});
