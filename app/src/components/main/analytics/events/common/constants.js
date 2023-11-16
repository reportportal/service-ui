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

import { LAUNCH_ANALYZE_TYPES } from 'common/constants/launchAnalyzeTypes';

export const GA_4_FIELD_LIMIT = 100;

const { ANALYZER_MODE, ANALYZE_ITEMS_MODE } = LAUNCH_ANALYZE_TYPES;

export const LAUNCH_ANALYZE_TYPES_TO_ANALYTICS_TITLES_MAP = {
  [ANALYZE_ITEMS_MODE.TO_INVESTIGATE]: 'investigate_items',
  [ANALYZE_ITEMS_MODE.AUTO_ANALYZED]: 'by_aa',
  [ANALYZE_ITEMS_MODE.MANUALLY_ANALYZED]: 'manually',
  [ANALYZER_MODE.ALL]: 'all_launches',
  [ANALYZER_MODE.LAUNCH_NAME]: 'previous_launches_with_the_same_name',
  [ANALYZER_MODE.CURRENT_LAUNCH]: 'current_launch',
  [ANALYZER_MODE.PREVIOUS_LAUNCH]: 'only_last_launch_with_the_same_name',
  [ANALYZER_MODE.CURRENT_AND_THE_SAME_NAME]: 'all_launches_with_the_same_name',
};
