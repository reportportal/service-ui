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
  testNameTitle: {
    id: 'testCaseSearch.testNameTitle',
    defaultMessage: 'Test name',
  },
  testNamePlaceholder: {
    id: 'testCaseSearch.testNamePlaceholder',
    defaultMessage: 'Enter test name',
  },
  letsSearch: {
    id: 'testCaseSearch.letsSearch',
    defaultMessage: "Let's search",
  },
  provideParameters: {
    id: 'testCaseSearch.provideParameters',
    defaultMessage: 'Provide parameters to activate the test case search.',
  },
  Attribute: {
    id: 'testCaseSearch.AttributeTitle',
    defaultMessage: 'Attribute',
  },
  oneOption: {
    id: 'testCaseSearch.oneOption',
    defaultMessage: 'Only one option, either test name or attributes, can be active at a time',
  },
  loadMore: {
    id: 'testCaseSearch.loadMore',
    defaultMessage: 'Load more',
  },
  maximumItems: {
    id: 'testCaseSearch.maximumItems',
    defaultMessage: 'You have loaded the maximum allowed number (300) of test cases.',
  },
  errorLoadingData: {
    id: 'testCaseSearch.errorLoadingData',
    defaultMessage: 'Keep typing to refine your search.',
  },
  statusTitle: {
    id: 'testCaseSearch.statusTitle',
    defaultMessage: 'Status',
  },
  statusPlaceholder: {
    id: 'testCaseSearch.statusPlaceholder',
    defaultMessage: 'Select status',
  },
  testNameOrAttributeRequired: {
    id: 'testCaseSearch.testNameOrAttributeRequired',
    defaultMessage: "Add 'Test Name' or 'Attribute' to work with 'Status' filter",
  },
});
