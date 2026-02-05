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
  noDescriptionAdded: {
    id: 'EditTestCasePage.noDescriptionAdded',
    defaultMessage: 'No description added',
  },
  editTestCase: {
    id: 'EditTestCasePage.editTestCase',
    defaultMessage: 'Edit Test Case',
  },
  enterTestCaseName: {
    id: 'TestCaseLibraryPage.enterTestCaseName',
    defaultMessage: 'Enter test case name',
  },
  copyRequirementsLink: {
    id: 'TestCaseDetailsPage.copyRequirementsLink',
    defaultMessage: 'Copy requirements link',
  },
  noRequirements: {
    id: 'TestCaseDetailsPage.noRequirements',
    defaultMessage: 'No requirements yet',
  },
  noPrecondition: {
    id: 'TestCaseDetailsPage.noPrecondition',
    defaultMessage: 'No precondition yet',
  },
  noSteps: {
    id: 'TestCaseDetailsPage.noSteps',
    defaultMessage: 'No steps yet',
  },
  noAttachments: {
    id: 'TestCaseDetailsPage.noAttachments',
    defaultMessage: 'No attachments added yet',
  },
});
