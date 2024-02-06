/*
 * Copyright 2023 EPAM Systems
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

import { DEFECT_TYPES_LOCATORS_TO_DEFECT_TYPES } from 'common/constants/defectTypes';
import { GA_4_FIELD_LIMIT } from 'components/main/analytics/events/common/constants';
import {
  STATISTICS_ENTITY_DELIMITER,
  FILTER_ENTITY_ID_TO_TYPE_MAP,
  STATISTICS_TOTAL_KEY,
} from './constants';
import { normalizeEventParameter } from '../ga4Utils';

/*
entityId format:
   statistics$executions$total ||
   statistics$defects$to_investigate$total ||
   statistics$defects$product_bug$pb001
 */
export const getFilterEntityType = ({ id: entityId, meta }) => {
  let type = FILTER_ENTITY_ID_TO_TYPE_MAP[entityId] || entityId;
  const isStatisticsEntity = entityId.indexOf(STATISTICS_ENTITY_DELIMITER) !== -1;

  if (isStatisticsEntity) {
    const statisticsEntityIdParts = entityId.split(STATISTICS_ENTITY_DELIMITER);
    const isTotal = statisticsEntityIdParts[3] === STATISTICS_TOTAL_KEY;
    type = statisticsEntityIdParts[2];

    if (isTotal || meta?.subItem) {
      type = `total_${type}`;
    }
  }

  return normalizeEventParameter(type);
};

export const getMakeDecisionElementName = (issueActionType) =>
  issueActionType ? 'apply_and_continue' : 'apply';

export const getDefectTypesAnalyticsData = (issueType) => {
  const defaultDefectTypeNumber = '001';
  const unselectedIssueType = 'unselected';

  return issueType
    ? DEFECT_TYPES_LOCATORS_TO_DEFECT_TYPES[issueType] ??
        `custom_${
          DEFECT_TYPES_LOCATORS_TO_DEFECT_TYPES[issueType?.slice(0, 2) + defaultDefectTypeNumber]
        }`
    : unselectedIssueType;
};

export const getSwitchedDefectTypes = (items, issueType) => {
  let switchedFrom = '';
  const switchedTo = `#${getDefectTypesAnalyticsData(issueType)}`;
  const maxSwitchedFromLength = GA_4_FIELD_LIMIT - switchedTo.length;

  for (let i = 0; i < items.length; i += 1) {
    if (switchedFrom.trim().length >= maxSwitchedFromLength) {
      switchedFrom = `${switchedFrom.slice(0, maxSwitchedFromLength - 1)}|${switchedTo}`;

      break;
    }

    switchedFrom = switchedFrom
      ? `${switchedFrom} ${getDefectTypesAnalyticsData(items[i].issue.issueType)}`
      : `${getDefectTypesAnalyticsData(items[i].issue.issueType)}`;

    if (i === items.length - 1) {
      switchedFrom = `${switchedFrom}${switchedTo}`;
    }
  }

  return switchedFrom;
};
