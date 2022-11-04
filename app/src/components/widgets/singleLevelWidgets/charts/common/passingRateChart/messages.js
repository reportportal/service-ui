/*
 * Copyright 2022 EPAM Systems
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

const FORM_GROUP_CONTROL = 'PassingRateFormGroupControlLabel';
const EXCLUDING_SKIPPED = 'PassingRateOptionExcludingSkipped';
const TOTAL_TEST_CASES = 'PassingRateOptionTotal';

const passingRateOptionMessages = defineMessages({
  [TOTAL_TEST_CASES]: {
    id: `PassingRatePerLaunchControls.${TOTAL_TEST_CASES}`,
    defaultMessage: 'Total test cases (Passed, Failed, Skipped)',
  },
  [EXCLUDING_SKIPPED]: {
    id: `PassingRatePerLaunchControls.${EXCLUDING_SKIPPED}`,
    defaultMessage: 'Total test cases excluding Skipped',
  },
  [FORM_GROUP_CONTROL]: {
    id: `PassingRatePerLaunchControls.${FORM_GROUP_CONTROL}`,
    defaultMessage: 'Ratio based on',
  },
});

export { passingRateOptionMessages, FORM_GROUP_CONTROL, EXCLUDING_SKIPPED, TOTAL_TEST_CASES };
