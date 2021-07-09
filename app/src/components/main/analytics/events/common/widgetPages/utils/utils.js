/*
 * Copyright 2021 EPAM Systems
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

import { ENTITY_NAME, ENTITY_START_TIME } from 'components/filterEntities/constants';
import {
  STATS_AB_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_SKIPPED,
  STATS_TI_TOTAL,
  STATS_TOTAL,
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  NO_DEFECT,
  TO_INVESTIGATE,
} from 'common/constants/statistics';

export const SORTING_ENTITY_MAP = {
  [ENTITY_NAME]: 'Launch Name',
  [ENTITY_START_TIME]: 'Start Time',
  [STATS_TOTAL]: 'Total',
  [STATS_PASSED]: 'Passed',
  [STATS_FAILED]: 'Failed',
  [STATS_SKIPPED]: 'Skipped',
  [STATS_PB_TOTAL]: 'Product Bug',
  [STATS_AB_TOTAL]: 'Auto Bug',
  [STATS_SI_TOTAL]: 'System Issue',
  [STATS_TI_TOTAL]: 'To Investigate',
  [PRODUCT_BUG]: 'Product Bug',
  [AUTOMATION_BUG]: 'Automation Bug',
  [SYSTEM_ISSUE]: 'System Issue',
  [NO_DEFECT]: 'No Defect',
  [TO_INVESTIGATE]: 'To Investigate',
};

export const getSelectCriteriaFields = (values) => {
  return values
    .map((key) => {
      return SORTING_ENTITY_MAP[`${key}`];
    })
    .join('#');
};
