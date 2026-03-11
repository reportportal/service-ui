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
  emptyPageTitle: {
    id: 'TestCaseLibraryPage.emptyTitle',
    defaultMessage: 'No test cases created yet',
  },
  emptyPageDescription: {
    id: 'TestCaseLibraryPage.emptyDescription',
    defaultMessage:
      'Your Test Case Library is empty. Start building comprehensive test cases to streamline your testing process and ensure product quality.',
  },
  folderEmptyPageDescription: {
    id: 'TestCaseLibraryPage.folderEmptyPageDescription',
    defaultMessage:
      'This folder has no test cases yet. Add some to enhance your testing workflow and maintain quality.',
  },
  numerableBlockTitle: {
    id: 'TestCaseLibraryPage.numerableBlock.title',
    defaultMessage: 'How to get started?',
  },
  createTestCase: {
    id: 'TestCaseLibraryPage.createTestCase',
    defaultMessage: 'Create Test Case',
  },
  addTestCase: {
    id: 'TestCaseLibraryPage.addTestCase',
    defaultMessage: 'Add Test Case',
  },
  createFolder: {
    id: 'TestCaseLibraryPage.createFolder',
    defaultMessage:
      '<strong>Create a folder</strong><br />Begin by creating a folder to organize your test cases. These folders can correspond to features, user stories, or any other entities that relate to your test cases.',
  },
  addTestCases: {
    id: 'TestCaseLibraryPage.addTestCases',
    defaultMessage:
      '<strong>Add test cases</strong><br />Within the selected folder, click "Create Test Case" to define your testing scenario. Ensure each test case is clearly described and includes necessary steps.',
  },
  tagTestCases: {
    id: 'TestCaseLibraryPage.tagTestCases',
    defaultMessage:
      '<strong>Tag your test cases</strong><br />Use tags to categorize and identify test cases efficiently. Add relevant tags during or after test case creation to enhance searchability and organization.',
  },
  noScenarioDetails: {
    id: 'EditTestCasePage.noScenarioDetails',
    defaultMessage: 'No scenario details yet',
  },
  scenarioDescription: {
    id: 'EditTestCasePage.scenarioDescription',
    defaultMessage:
      'Build a detailed test case by adding a manual scenario and unique details like requirements, preconditions, and steps.',
  },
  noScenarioDetailsDescription: {
    id: 'EditTestCasePage.noScenarioDetailsDescription',
    defaultMessage:
      'Build a detailed test case by adding a manual scenario and unique details like requirements, preconditions, and steps.',
  },
});
