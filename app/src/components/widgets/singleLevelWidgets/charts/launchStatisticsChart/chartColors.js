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

import { getItemColor, getItemNameConfig } from 'components/widgets/common/utils';
import { DEFECTS, EXECUTIONS } from 'components/widgets/common/constants';
import {
  COLOR_CHART_PASSED,
  COLOR_CHART_FAILED,
  COLOR_CHART_SKIPPED,
  COLOR_PRODUCT_BUG,
  COLOR_AUTOMATION_BUG,
  COLOR_NO_DEFECT,
  COLOR_SYSTEM_ISSUE,
  COLOR_TO_INVESTIGATE,
} from 'common/constants/colors';
import { TOTAL_KEY } from './constants';

const STATUS_COLORS = {
  passed: COLOR_CHART_PASSED,
  failed: COLOR_CHART_FAILED,
  skipped: COLOR_CHART_SKIPPED,
};

const DEFECT_GROUP_COLORS = {
  product_bug: COLOR_PRODUCT_BUG,
  automation_bug: COLOR_AUTOMATION_BUG,
  no_defect: COLOR_NO_DEFECT,
  system_issue: COLOR_SYSTEM_ISSUE,
  to_investigate: COLOR_TO_INVESTIGATE,
};

export const getLaunchStatisticsColor = (itemName, defectTypes) => {
  const { itemType, defectType, locator } = getItemNameConfig(itemName);

  if (itemType === EXECUTIONS && STATUS_COLORS[defectType]) {
    return STATUS_COLORS[defectType];
  }
  if (itemType === DEFECTS && DEFECT_GROUP_COLORS[defectType]) {
    const groupConfig = defectTypes?.[defectType.toUpperCase()];
    const isGroupLevel = !locator || locator === TOTAL_KEY || locator === groupConfig?.[0]?.locator;
    if (isGroupLevel) {
      return DEFECT_GROUP_COLORS[defectType];
    }
  }
  return getItemColor(itemName, defectTypes);
};
