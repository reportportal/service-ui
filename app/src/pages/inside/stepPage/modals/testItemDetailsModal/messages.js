/*
 * Copyright 2019 EPAM Systems
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
  modalTitle: {
    id: 'TestItemDetailsModal.title',
    defaultMessage: 'Test item details',
  },
  testCaseUId: {
    id: 'TestItemDetailsModal.testCaseUId',
    defaultMessage: 'Unique test case id:',
  },
  testCaseId: {
    id: 'TestItemDetailsModal.testCaseId',
    defaultMessage: 'Test case id:',
  },
  duration: {
    id: 'TestItemDetailsModal.duration',
    defaultMessage: 'Duration:',
  },
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
  stacktrace: {
    id: 'TestItemDetailsModal.stacktrace',
    defaultMessage: 'Stacktrace:',
  },
  codeRef: {
    id: 'TestItemDetailsModal.codeRef',
    defaultMessage: 'Code reference:',
  },
  attributesLabel: {
    id: 'EditItemModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  parametersLabel: {
    id: 'TestItemDetailsModal.parametersLabel',
    defaultMessage: 'Parameters:',
  },
  descriptionPlaceholder: {
    id: 'EditItemModal.descriptionPlaceholder',
    defaultMessage: 'Enter test item description',
  },
  launchWarning: {
    id: 'EditItemModal.launchWarning',
    defaultMessage:
      'Change of description and attributes can affect your filtering results, widgets, trends',
  },
  itemUpdateSuccess: {
    id: 'EditItemModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
  detailsTabTitle: {
    id: 'EditItemModal.detailsTabTitle',
    defaultMessage: 'Details',
  },
  stackTraceTabTitle: {
    id: 'EditItemModal.stackTraceTabTitle',
    defaultMessage: 'Stack trace',
  },
});
