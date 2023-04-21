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

import {
  ENTITY_ATTRIBUTE,
  ENTITY_NAME,
  ENTITY_NUMBER,
  ENTITY_USER,
  ENTITY_START_TIME,
  ENTITY_DESCRIPTION,
  ENTITY_DEFECT_COMMENT,
  ENTITY_DEFECT_TYPE,
  ENTITY_METHOD_TYPE,
  ENTITY_IGNORE_ANALYZER,
  ENTITY_PATTERN_NAME,
  ENTITY_RETRY,
  ENTITY_STATUS,
  ENTITY_NEW_FAILURE,
  ENTITY_AUTOANALYZE,
  ENTITY_BTS_ISSUES,
} from 'components/filterEntities/constants';

export const STATISTICS_ENTITY_DELIMITER = '$';
export const STATISTICS_TOTAL_KEY = 'total';

// For now only test item pages entities covered
export const FILTER_ENTITY_ID_TO_TYPE_MAP = {
  [ENTITY_ATTRIBUTE]: 'attribute',
  [ENTITY_NAME]: 'name',
  [ENTITY_NUMBER]: 'launch_number',
  [ENTITY_START_TIME]: 'start_time',
  [ENTITY_DESCRIPTION]: 'description',
  [ENTITY_USER]: 'owner',
  [ENTITY_METHOD_TYPE]: 'method_type',
  [ENTITY_STATUS]: 'status',
  [ENTITY_DEFECT_TYPE]: 'defect_type',
  [ENTITY_DEFECT_COMMENT]: 'defect_comment',
  [ENTITY_AUTOANALYZE]: 'analyzed_by_rp',
  [ENTITY_PATTERN_NAME]: 'pattern_name',
  [ENTITY_IGNORE_ANALYZER]: 'ignore_in_aa',
  [ENTITY_BTS_ISSUES]: 'issue_in_bts',
  [ENTITY_RETRY]: 'retry',
  [ENTITY_NEW_FAILURE]: 'new_failure',
};

export const DEFECT_FROM_TI_GROUP_MAP = {
  true: 'to_investigate',
  false: 'no_investigate',
};
