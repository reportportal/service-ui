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
} from 'common/constants/statistics';
import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'pages/inside/dashboardItemPage/modals/common/widgetControls/productStatusControls';

export const getClearNameSelectSortingWidgetModal = (name) => {
  switch (name) {
    case ENTITY_NAME:
      return 'Launch Name';
    case ENTITY_START_TIME:
      return 'Start Time';
    case STATS_TOTAL:
      return 'Total';
    case STATS_PASSED:
      return 'Passed';
    case STATS_FAILED:
      return 'Failed';
    case STATS_SKIPPED:
      return 'Skipped';
    case STATS_PB_TOTAL:
      return 'Product Bug';
    case STATS_AB_TOTAL:
      return 'Auto Bug';
    case STATS_SI_TOTAL:
      return 'System Issue';
    case STATS_TI_TOTAL:
      return 'To Investigate';
    case PRODUCT_BUG:
      return 'Product Bug';
    case AUTOMATION_BUG:
      return 'Automation Bug';
    case SYSTEM_ISSUE:
      return 'System Issue';
    case NO_DEFECT:
      return 'No Defect';
    case TO_INVESTIGATE:
      return 'To Investigate';
    default:
      return '';
  }
};

export const getSelectCriteriaFields = (value) => {
  const result = value
    .map((v) => {
      return getClearNameSelectSortingWidgetModal(v);
    })
    .join('#');
  return result;
};
