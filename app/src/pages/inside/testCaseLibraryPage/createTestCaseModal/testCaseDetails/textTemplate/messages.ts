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
  instructions: {
    id: 'createTestCaseModal.instructions',
    defaultMessage: 'Instructions',
  },
  enterInstructions: {
    id: 'createTestCaseModal.enterInstructions',
    defaultMessage: 'Enter instructions to execute this scenario',
  },
  expectedResult: {
    id: 'createTestCaseModal.expectedResult',
    defaultMessage: 'Expected result',
  },
  enterExpectedResult: {
    id: 'createTestCaseModal.enterExpectedResult',
    defaultMessage: 'Enter the expected result here',
  },
});
