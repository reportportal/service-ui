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
  createNewLaunch: {
    id: 'CreateLaunchModal.createNewLaunch',
    defaultMessage: 'Create new launch',
  },
  addToExistingLaunch: {
    id: 'CreateLaunchModal.addToExistingLaunch',
    defaultMessage: 'Add to existing launch',
  },
  searchAndSelectLaunch: {
    id: 'LaunchFormFields.searchAndSelectLaunch',
    defaultMessage: 'Search and select launch',
  },
  enterLaunchName: {
    id: 'LaunchFormFields.enterLaunchName',
    defaultMessage: 'Enter launch name',
  },
  addLaunchDescriptionOptional: {
    id: 'LaunchFormFields.addLaunchDescriptionOptional',
    defaultMessage: 'Please provide details about the launch (optional).',
  },
  launchAttributes: {
    id: 'LaunchFormFields.launchAttributes',
    defaultMessage: 'Launch attributes',
  },
  addAttributes: {
    id: 'LaunchFormFields.addAttributes',
    defaultMessage: 'Add Attribute',
  },
  launchName: {
    id: 'LaunchFormFields.launchName',
    defaultMessage: 'Launch name',
  },
  addOnlyUncoveredTestCases: {
    id: 'LaunchFormFields.addOnlyUncoveredTestCases',
    defaultMessage: 'Add only uncovered test cases',
  },
  addTestCasesFromTestPlan: {
    id: 'LaunchFormFields.addTestCasesFromTestPlan',
    defaultMessage:
      'You are about to add test cases from <bold>{testPlanName}</bold> test plan to a Launch',
  },
  testPlanLabel: {
    id: 'LaunchFormFields.testPlanLabel',
    defaultMessage: 'Test plan',
  },
  selectTestPlanPlaceholder: {
    id: 'LaunchFormFields.selectTestPlanPlaceholder',
    defaultMessage: 'Select test plan',
  },
  tooManyLaunchesResult: {
    id: 'LaunchFormFields.tooManyLaunchesResult',
    defaultMessage: 'Too many results. Please refine your search',
  },
  launchNameRequired: {
    id: 'LaunchFormFields.launchNameRequired',
    defaultMessage: 'Launch name is required',
  },
  testCasesAddedSuccess: {
    id: 'LaunchFormFields.testCasesAddedSuccess',
    defaultMessage: 'Test cases have been added to launch successfully',
  },
  testCaseAddedSuccess: {
    id: 'LaunchFormFields.testCaseAddedSuccess',
    defaultMessage: 'Test case "{testCaseName}" has been added to launch successfully',
  },
  launchCreatedSuccess: {
    id: 'LaunchFormFields.launchCreatedSuccess',
    defaultMessage: 'Launch "{launchName}" has been created successfully',
  },
  launchCreationFailed: {
    id: 'LaunchFormFields.launchCreationFailed',
    defaultMessage: 'Failed to create launch',
  },
});
