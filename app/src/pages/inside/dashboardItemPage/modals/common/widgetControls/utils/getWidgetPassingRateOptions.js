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

const TOTAL_TEST_CASES_MESSAGE = 'Total test cases (Passed, Failed, Skipped)';
const FORM_GROUP_CONTROL_MESSAGE = 'Ratio based on';
const EXCLUDING_SKIPPED_MESSAGE = 'Total test cases excluding Skipped';

const FORM_GROUP_CONTROL = 'ratioBasedOn';
const EXCLUDING_SKIPPED = 'excludingSkipped';
const TOTAL_TEST_CASES = 'total';

const PASSING_RATE_OPTIONS = 'PassingRateOptions';

const messages = defineMessages({
  [TOTAL_TEST_CASES]: {
    id: `${PASSING_RATE_OPTIONS}.${TOTAL_TEST_CASES}`,
    defaultMessage: TOTAL_TEST_CASES_MESSAGE,
  },
  [EXCLUDING_SKIPPED]: {
    id: `${PASSING_RATE_OPTIONS}.${EXCLUDING_SKIPPED}`,
    defaultMessage: EXCLUDING_SKIPPED_MESSAGE,
  },
  [FORM_GROUP_CONTROL]: {
    id: `${PASSING_RATE_OPTIONS}.${FORM_GROUP_CONTROL}`,
    defaultMessage: FORM_GROUP_CONTROL_MESSAGE,
  },
});

const getWidgetPassingRateOptions = (formatMessage) =>
  [TOTAL_TEST_CASES, EXCLUDING_SKIPPED].map((option) => ({
    label: formatMessage(messages[`${option}`]),
    value: option,
    disabled: false,
  }));

const formGroupControlMessage = messages[FORM_GROUP_CONTROL];

export {
  getWidgetPassingRateOptions,
  formGroupControlMessage,
  TOTAL_TEST_CASES,
  EXCLUDING_SKIPPED,
};
