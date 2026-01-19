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
  description: {
    id: 'TestCaseLibraryPage.addToLaunchModal.description',
    defaultMessage: 'You are about to add <bold>{testCaseName}</bold> test case to a Launch',
  },
  launchNameLabel: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchNameLabel',
    defaultMessage: 'Launch name',
  },
  launchNamePlaceholder: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchNamePlaceholder',
    defaultMessage: 'Enter launch name',
  },
  launchNameHint: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchNameHint',
    defaultMessage:
      'When you select an existing launch from the suggestions, or if the provided launch name matches one that already exists, a launch with new number will be created. {learnMoreLink}',
  },
  launchDescriptionLabel: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchDescriptionLabel',
    defaultMessage: 'Description',
  },
  launchAttributesLabel: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchAttributesLabel',
    defaultMessage: 'Launch attributes',
  },
  launchAddAttributeButton: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchAddAttributeButton',
    defaultMessage: 'Add attribute',
  },
  launchDescriptionPlaceholder: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchDescriptionPlaceholder',
    defaultMessage: 'Please provide details about the launch (optional).',
  },
  launchNameExistingPlaceholder: {
    id: 'TestCaseLibraryPage.addToLaunchModal.launchNameExistingPlaceholder',
    defaultMessage: 'Search and select launch name',
  },
  addToLaunchButton: {
    id: 'TestCaseLibraryPage.addToLaunchModal.addToLaunchButton',
    defaultMessage: 'Add to existing launch',
  },
  createNewLaunchButton: {
    id: 'TestCaseLibraryPage.addToLaunchModal.createNewLaunchButton',
    defaultMessage: 'Create new launch',
  },
  learnMore: {
    id: 'Common.learnMore',
    defaultMessage: 'Learn more >',
  },
});
