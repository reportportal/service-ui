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
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import {
  COMPONENT_HEALTH_CHECK,
  COMPONENT_HEALTH_CHECK_TABLE,
  CUMULATIVE_TREND,
  DIFFERENT_LAUNCHES_COMPARISON,
  FAILED_CASES_TREND,
  FLAKY_TEST_CASES_TABLE,
  INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
  LAUNCH_DURATION,
  LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
  LAUNCH_STATISTICS,
  LAUNCHES_TABLE,
  MOST_FAILED_TEST_CASES_TABLE,
  MOST_POPULAR_PATTERNS,
  MOST_TIME_CONSUMING,
  NON_PASSED_TEST_CASES_TREND,
  OVERALL_STATISTICS,
  PASSING_RATE_PER_LAUNCH,
  PASSING_RATE_SUMMARY,
  PROJECT_ACTIVITY,
  TEST_CASES_GROWTH_TREND,
  UNIQUE_BUGS_TABLE,
} from 'common/constants/widgetTypes';
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

export const WIDGET_MODE_VALUES_MAP = {
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

const sortDashboardWidgets = (widgets) => {
  return widgets.sort((a, b) => {
    if (a.widgetPosition.positionY < b.widgetPosition.positionY) return -1;
    if (a.widgetPosition.positionY > b.widgetPosition.positionY) return 1;
    if (a.widgetPosition.positionX < b.widgetPosition.positionX) return -1;
    if (a.widgetPosition.positionX < b.widgetPosition.positionX) return 1;
    return 0;
  });
};

export const getEcWidget = ({ itemId, itemName, index, itemVariant, itemListName }) => ({
  item_id: itemId,
  item_name: itemName,
  item_variant: itemVariant,
  item_list_name: itemListName,
  index,
});

export const formatEcDashboardData = (dashboard) => {
  const sortedWidgets = sortDashboardWidgets([...dashboard.widgets]);
  return sortedWidgets.map((widget, index) =>
    getEcWidget({
      itemListName: dashboard.id,
      itemId: widget.widgetId,
      index: index + 1,
      itemName: widgetTypesMessages[widget.widgetType].defaultMessage,
    }),
  );
};

const COMMON_FIELD_EVENT_NAMES = {
  filter: 'filter',
};

export const WIDGET_FIELD_EVENT_NAME_BY_TYPE = {
  [LAUNCH_STATISTICS]: {
    'contentParameters.contentFields': 'criteria_for_widget',
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.zoom': 'zoom_widget_area',
    'contentParameters.widgetOptions.timeline': 'toggler',
    'contentParameters.widgetOptions.viewMode': 'toggler',
  },
  [LAUNCH_DURATION]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.latest': 'toggler',
  },
  [PROJECT_ACTIVITY]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.actionType': 'criteria_for_widget',
    'contentParameters.widgetOptions.user': 'user_name',
  },
  [INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.timeline': 'toggler',
    'contentParameters.widgetOptions.viewMode': 'toggler',
  },
  [UNIQUE_BUGS_TABLE]: {
    'contentParameters.widgetOptions.latest': 'toggler',
  },
  [FAILED_CASES_TREND]: {
    'contentParameters.itemsCount': 'items',
  },
  [DIFFERENT_LAUNCHES_COMPARISON]: {},
  [PASSING_RATE_SUMMARY]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.viewMode': 'toggler',
  },
  [CUMULATIVE_TREND]: {
    'contentParameters.itemsCount': 'number_of_launches',
    'contentParameters.widgetOptions.attributes': 'level',
  },
  [COMPONENT_HEALTH_CHECK]: {
    'contentParameters.widgetOptions.latest': 'toggler',
    'contentParameters.widgetOptions.attributeKeys': 'level',
  },
  [MOST_TIME_CONSUMING]: {
    'contentParameters.contentFields': 'criteria_for_widget',
    'contentParameters.widgetOptions.launchNameFilter': 'launch_name',
    'contentParameters.widgetOptions.viewMode': 'toggler',
    'contentParameters.widgetOptions.includeMethods': 'include_before_and_after_methods',
  },
  [OVERALL_STATISTICS]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.contentFields': 'criteria_for_widget',
    'contentParameters.widgetOptions.viewMode': 'toggler',
    'contentParameters.widgetOptions.latest': 'toggler',
  },
  [LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: {},
  [TEST_CASES_GROWTH_TREND]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.widgetOptions.timeline': 'toggler',
  },
  [LAUNCHES_TABLE]: {
    'contentParameters.itemsCount': 'items',
    'contentParameters.contentFields': 'criteria_for_widget',
  },
  [MOST_FAILED_TEST_CASES_TABLE]: {
    'contentParameters.contentFields': 'criteria_for_widget',
    'contentParameters.itemsCount': 'launches_count',
    'contentParameters.widgetOptions.launchNameFilter': 'launch_name',
    'contentParameters.widgetOptions.includeMethods': 'include_before_and_after_methods',
  },
  [NON_PASSED_TEST_CASES_TREND]: {
    'contentParameters.itemsCount': 'items',
  },
  [PASSING_RATE_PER_LAUNCH]: {
    'contentParameters.widgetOptions.launchNameFilter': 'launch_name',
    'contentParameters.widgetOptions.viewMode': 'toggler',
  },
  [FLAKY_TEST_CASES_TABLE]: {
    'contentParameters.itemsCount': 'launches_count',
    'contentParameters.widgetOptions.launchNameFilter': 'launch_name',
    'contentParameters.widgetOptions.includeMethods': 'include_before_and_after_methods',
  },
  [MOST_POPULAR_PATTERNS]: {
    'contentParameters.itemsCount': 'number_of_launches',
    'contentParameters.widgetOptions.latest': 'toggler',
  },
  [COMPONENT_HEALTH_CHECK_TABLE]: {
    'contentParameters.widgetOptions.attributeKeys': 'level',
    'contentParameters.widgetOptions.latest': 'toggler',
  },
};

export const getJoinedFieldEventNamesByType = (type, keys = []) => {
  const uniqueValues = new Set();
  const changedFields = {
    ...COMMON_FIELD_EVENT_NAMES,
    ...(WIDGET_FIELD_EVENT_NAME_BY_TYPE[type] || {}),
  };

  keys.forEach((key) => {
    const value = changedFields[key];
    if (value) {
      uniqueValues.add(value);
    }
  });

  return Array.from(uniqueValues).join('#') || 'not_set';
};
