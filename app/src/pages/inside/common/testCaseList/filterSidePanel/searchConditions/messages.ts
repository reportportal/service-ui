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
  search: {
    id: 'FilterSidePanel.search',
    defaultMessage: 'Search',
  },
  searchHelpText: {
    id: 'FilterSidePanel.searchHelpText',
    defaultMessage:
      'Add a condition: choose where to search and enter the text. Test cases that match all conditions are shown.',
  },
  addCondition: {
    id: 'FilterSidePanel.addCondition',
    defaultMessage: 'Add Condition',
  },
  removeCondition: {
    id: 'FilterSidePanel.removeCondition',
    defaultMessage: 'Remove condition',
  },
  conditionPlaceholder: {
    id: 'FilterSidePanel.conditionPlaceholder',
    defaultMessage: 'Enter text to find',
  },
  multilineHelpText: {
    id: 'FilterSidePanel.multilineConditionHelpText',
    defaultMessage:
      'Step-based test cases: searched in every step. Text-based test cases: searched in the scenario.',
  },
  name: {
    id: 'FilterSidePanel.searchFieldName',
    defaultMessage: 'Name',
  },
  description: {
    id: 'FilterSidePanel.searchFieldDescription',
    defaultMessage: 'Description',
  },
  precondition: {
    id: 'FilterSidePanel.searchFieldPrecondition',
    defaultMessage: 'Precondition',
  },
  instructions: {
    id: 'FilterSidePanel.searchFieldInstructions',
    defaultMessage: 'Instructions',
  },
  expectedResult: {
    id: 'FilterSidePanel.searchFieldExpectedResult',
    defaultMessage: 'Expected result',
  },
});
