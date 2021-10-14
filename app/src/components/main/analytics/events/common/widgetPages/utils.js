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
} from 'common/constants/statistics';
import { getDefectTypeLabel } from '../../common/utils';

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
};

const WIDGET_MODE_VALUES_MAP = {
  launch: 'Launch mode',
  day: 'Timeline mode',
  'latest-false': 'All launches',
  'latest-true': 'Latest launches',
  'area-spline': 'Area view',
  bar: 'Bar view',
  donut: 'Donut view',
  panel: 'Panel view',
  pie: 'Pie view',
  table: 'Table view',
};

export const getSelectCriteriaFields = (values) =>
  values
    .map((key) => {
      return getDefectTypeLabel(key) || SORTING_ENTITY_MAP[`${key}`];
    })
    .join('#');

export const getWidgetModeValuesString = (options) => {
  let widgetOptions = options;
  if (Object.prototype.hasOwnProperty.call(widgetOptions, 'latest')) {
    const latest = `latest-${options.latest}`;
    widgetOptions = { ...options, latest };
  }
  return Object.values(widgetOptions)
    .filter((option) => WIDGET_MODE_VALUES_MAP[`${option}`])
    .map((value) => WIDGET_MODE_VALUES_MAP[`${value}`])
    .join('#');
};
