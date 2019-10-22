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

import * as AVAILABLE_COLORS from 'common/constants/colors';

export const TO_INVESTIGATE = 'toInvestigate';
export const INVESTIGATED = 'investigated';
export const AUTOMATION_BUG = 'automationBug';
export const PRODUCT_BUG = 'productBug';
export const SYSTEM_ISSUE = 'systemIssue';
export const DEFECT_TYPES = [
  TO_INVESTIGATE,
  INVESTIGATED,
  AUTOMATION_BUG,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
];
export const LAUNCHES_QUANTITY = 'launchesQuantity';

export const EXECUTIONS = 'executions';
export const DEFECTS = 'defects';
export const TOTAL_KEY = 'total';

export const COLORS = {
  [TO_INVESTIGATE]: AVAILABLE_COLORS[`COLOR_${TO_INVESTIGATE.toUpperCase()}`],
  [INVESTIGATED]: AVAILABLE_COLORS[`COLOR_${INVESTIGATED.toUpperCase()}`],
  [AUTOMATION_BUG]: AVAILABLE_COLORS[`COLOR_${AUTOMATION_BUG.toUpperCase()}`],
  [PRODUCT_BUG]: AVAILABLE_COLORS[`COLOR_${PRODUCT_BUG.toUpperCase()}`],
  [SYSTEM_ISSUE]: AVAILABLE_COLORS[`COLOR_${SYSTEM_ISSUE.toUpperCase()}`],
};

export const CHART_OFFSET = 40.5;
