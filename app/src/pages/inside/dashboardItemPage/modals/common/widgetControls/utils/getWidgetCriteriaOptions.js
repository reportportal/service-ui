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
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
  STATS_AB_TOTAL,
  STATS_ND_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
} from 'common/constants/statistics';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
  NO_DEFECT,
  DEFECT_TYPES_SEQUENCE,
} from 'common/constants/defectTypes';
import {
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  UPDATE_PROJECT,
  ACTIONS_WITH_ISSUES,
  ACTIONS_WITH_DASHBOARDS,
  ACTIONS_WITH_WIDGETS,
  ACTIONS_WITH_FILTERS,
  ACTIONS_WITH_INTEGRATIONS,
  ACTIONS_WITH_AA_SETTINGS,
  ACTIONS_WITH_DEFECTS,
  ACTIONS_WITH_IMPORT,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
  ASSIGN_USER,
  UNASSIGN_USER,
  CHANGE_ROLE,
  CREATE_PROJECT,
  UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
  MARK_LAUNCH_AS_IMPORTANT,
  UNMARK_LAUNCH_AS_IMPORTANT,
} from 'common/constants/actionTypes';
import { getGroupedDefectTypesOptions } from 'pages/inside/common/utils';
import { defectTypesLocalization } from 'common/constants/localization/defectTypesLocalization';
import {
  LAUNCH_STATUSES_OPTIONS,
  DEFECT_TYPES_OPTIONS,
  GROUPED_DEFECT_TYPES_OPTIONS,
  USER_ACTIONS_OPTIONS,
  LAUNCH_GRID_COLUMNS_OPTIONS,
  DEFECT_TYPES_GROUPS_OPTIONS,
  DEFECT_STATISTICS_OPTIONS,
  SKIPPED_FAILED_LAUNCHES_OPTIONS,
  PASSED_FAILED_LAUNCHES_OPTIONS,
  TO_INVESTIGATE_OPTION,
} from '../constants';

const messages = defineMessages({
  CriteriaTotal: {
    id: 'WidgetCriteriaOption.CriteriaTotal',
    defaultMessage: 'Total',
  },
  CriteriaPassed: {
    id: 'WidgetCriteriaOption.CriteriaPassed',
    defaultMessage: 'Passed',
  },
  CriteriaFailed: {
    id: 'WidgetCriteriaOption.CriteriaFailed',
    defaultMessage: 'Failed',
  },
  CriteriaSkipped: {
    id: 'WidgetCriteriaOption.CriteriaSkipped',
    defaultMessage: 'Skipped',
  },
  [START_LAUNCH]: {
    id: 'WidgetCriteriaOption.start_launch',
    defaultMessage: 'Start launch',
  },
  [FINISH_LAUNCH]: {
    id: 'WidgetCriteriaOption.finish_launch',
    defaultMessage: 'Finish launch',
  },
  [DELETE_LAUNCH]: {
    id: 'WidgetCriteriaOption.delete_launch',
    defaultMessage: 'Delete launch',
  },
  [MARK_LAUNCH_AS_IMPORTANT]: {
    id: 'WidgetCriteriaOption.markLaunchAsImportant',
    defaultMessage: 'Mark launch as important',
  },
  [UNMARK_LAUNCH_AS_IMPORTANT]: {
    id: 'WidgetCriteriaOption.unmarkLaunchAsImportant',
    defaultMessage: 'Unmark launch as important',
  },
  [ACTIONS_WITH_ISSUES]: {
    id: 'WidgetCriteriaOption.issues_actions',
    defaultMessage: 'Actions with issues',
  },
  [ASSIGN_USER]: {
    id: 'WidgetCriteriaOption.assign_user',
    defaultMessage: 'Assign, invite user',
  },
  [UNASSIGN_USER]: {
    id: 'WidgetCriteriaOption.unassign_user',
    defaultMessage: 'Unassign user',
  },
  [CHANGE_ROLE]: { id: 'WidgetCriteriaOption.change_role', defaultMessage: 'Change role' },

  [ASSIGN_USER]: {
    id: 'WidgetCriteriaOption.assign_user',
    defaultMessage: 'Assign, invite user',
  },
  [UNASSIGN_USER]: {
    id: 'WidgetCriteriaOption.unassign_user',
    defaultMessage: 'Unassign user',
  },

  [ACTIONS_WITH_DASHBOARDS]: {
    id: 'WidgetCriteriaOption.dashboards_actions',
    defaultMessage: 'Update dashboard',
  },
  [ACTIONS_WITH_WIDGETS]: {
    id: 'WidgetCriteriaOption.widgets_actions',
    defaultMessage: 'Update widget',
  },
  [ACTIONS_WITH_FILTERS]: {
    id: 'WidgetCriteriaOption.filters_actions',
    defaultMessage: 'Update filter',
  },
  [ACTIONS_WITH_INTEGRATIONS]: {
    id: 'WidgetCriteriaOption.integration_actions',
    defaultMessage: 'Update integration',
  },
  [UPDATE_PROJECT]: {
    id: 'WidgetCriteriaOption.update_project',
    defaultMessage: 'Update project settings',
  },
  [ACTIONS_WITH_AA_SETTINGS]: {
    id: 'WidgetCriteriaOption.aa_settings_actions',
    defaultMessage: 'Update Auto-Analysis settings',
  },
  [ACTIONS_WITH_DEFECTS]: {
    id: 'WidgetCriteriaOption.defects_actions',
    defaultMessage: 'Update defect types',
  },
  [ACTIONS_WITH_IMPORT]: {
    id: 'WidgetCriteriaOption.import_actions',
    defaultMessage: 'Import',
  },
  [CREATE_PATTERN]: {
    id: 'WidgetCriteriaOption.create_pattern',
    defaultMessage: 'Create pattern',
  },
  [UPDATE_PATTERN]: {
    id: 'WidgetCriteriaOption.update_pattern',
    defaultMessage: 'Update pattern',
  },
  [DELETE_PATTERN]: {
    id: 'WidgetCriteriaOption.delete_pattern',
    defaultMessage: 'Delete pattern',
  },
  [MATCHED_PATTERN]: {
    id: 'WidgetCriteriaOption.matched_pattern',
    defaultMessage: 'Pattern matched',
  },
  [CREATE_PROJECT]: {
    id: 'WidgetCriteriaOption.create_project',
    defaultMessage: 'Create project',
  },
  [UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS]: {
    id: 'WidgetCriteriaOption.updateAutoPatternAnalysisSettings',
    defaultMessage: 'Update Pattern-Analysis settings',
  },

  attributes: {
    id: 'WidgetCriteriaOption.attributes',
    defaultMessage: 'Attributes',
  },
  user: {
    id: 'WidgetCriteriaOption.user',
    defaultMessage: 'User',
  },
  startTime: {
    id: 'WidgetCriteriaOption.startTime',
    defaultMessage: 'Start time',
  },
  endTime: {
    id: 'WidgetCriteriaOption.endTime',
    defaultMessage: 'Finish time',
  },
  description: {
    id: 'WidgetCriteriaOption.description',
    defaultMessage: 'Description',
  },
});

const DEFECT_STATISTICS_BASE = 'statistics$defects$';

const getLaunchStatusesOptions = (formatMessage) => [
  { value: STATS_TOTAL, label: formatMessage(messages.CriteriaTotal) },
  { value: STATS_PASSED, label: formatMessage(messages.CriteriaPassed) },
  { value: STATS_FAILED, label: formatMessage(messages.CriteriaFailed) },
  { value: STATS_SKIPPED, label: formatMessage(messages.CriteriaSkipped) },
];

const getSkippedFailedLaunchesOptions = (formatMessage) => [
  { value: STATS_FAILED, label: formatMessage(messages.CriteriaFailed) },
  { value: STATS_SKIPPED, label: formatMessage(messages.CriteriaSkipped) },
];

const getPassedFailedLaunchesOptions = (formatMessage) => [
  { value: STATS_PASSED, label: formatMessage(messages.CriteriaPassed) },
  { value: STATS_FAILED, label: formatMessage(messages.CriteriaFailed) },
];

const getDefectStatisticsOptions = (formatMessage) => [
  { value: STATS_PB_TOTAL, label: formatMessage(defectTypesLocalization[PRODUCT_BUG]) },
  { value: STATS_AB_TOTAL, label: formatMessage(defectTypesLocalization[AUTOMATION_BUG]) },
  { value: STATS_SI_TOTAL, label: formatMessage(defectTypesLocalization[SYSTEM_ISSUE]) },
  { value: STATS_ND_TOTAL, label: formatMessage(defectTypesLocalization[NO_DEFECT]) },
];

const getToInvestigateStatisticsOption = (formatMessage) => [
  { value: STATS_TI_TOTAL, label: formatMessage(defectTypesLocalization[TO_INVESTIGATE]) },
];

const getDefectTypesOptions = (defectTypes, formatMessage) => {
  let defectTypesOptions = [];
  DEFECT_TYPES_SEQUENCE.forEach((defectTypeId) => {
    const defectTypeGroup = defectTypes[defectTypeId];

    defectTypesOptions = defectTypesOptions.concat(
      defectTypeGroup.map((defectType) => ({
        value: `${DEFECT_STATISTICS_BASE}${defectType.typeRef.toLowerCase()}$${defectType.locator}`,
        label: messages[defectType.locator]
          ? formatMessage(messages[`Defect_Type_${defectType.locator}`])
          : defectType.longName,
      })),
    );
  });
  return defectTypesOptions;
};

const getUserActionOptions = (formatMessage) => [
  { value: START_LAUNCH, label: formatMessage(messages[START_LAUNCH]) },
  { value: FINISH_LAUNCH, label: formatMessage(messages[FINISH_LAUNCH]) },
  { value: DELETE_LAUNCH, label: formatMessage(messages[DELETE_LAUNCH]) },
  { value: MARK_LAUNCH_AS_IMPORTANT, label: formatMessage(messages[MARK_LAUNCH_AS_IMPORTANT]) },
  { value: UNMARK_LAUNCH_AS_IMPORTANT, label: formatMessage(messages[UNMARK_LAUNCH_AS_IMPORTANT]) },
  { value: ACTIONS_WITH_ISSUES, label: formatMessage(messages[ACTIONS_WITH_ISSUES]) },
  { value: ASSIGN_USER, label: formatMessage(messages[ASSIGN_USER]) },
  { value: UNASSIGN_USER, label: formatMessage(messages[UNASSIGN_USER]) },
  { value: CHANGE_ROLE, label: formatMessage(messages[CHANGE_ROLE]) },
  { value: ACTIONS_WITH_DASHBOARDS, label: formatMessage(messages[ACTIONS_WITH_DASHBOARDS]) },
  { value: ACTIONS_WITH_WIDGETS, label: formatMessage(messages[ACTIONS_WITH_WIDGETS]) },
  { value: ACTIONS_WITH_FILTERS, label: formatMessage(messages[ACTIONS_WITH_FILTERS]) },
  { value: ACTIONS_WITH_INTEGRATIONS, label: formatMessage(messages[ACTIONS_WITH_INTEGRATIONS]) },
  { value: UPDATE_PROJECT, label: formatMessage(messages[UPDATE_PROJECT]) },
  { value: ACTIONS_WITH_AA_SETTINGS, label: formatMessage(messages[ACTIONS_WITH_AA_SETTINGS]) },
  { value: ACTIONS_WITH_DEFECTS, label: formatMessage(messages[ACTIONS_WITH_DEFECTS]) },
  { value: ACTIONS_WITH_IMPORT, label: formatMessage(messages[ACTIONS_WITH_IMPORT]) },
  {
    value: UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
    label: formatMessage(messages[UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS]),
  },
  { value: CREATE_PATTERN, label: formatMessage(messages[CREATE_PATTERN]) },
  { value: UPDATE_PATTERN, label: formatMessage(messages[UPDATE_PATTERN]) },
  { value: DELETE_PATTERN, label: formatMessage(messages[DELETE_PATTERN]) },
  { value: MATCHED_PATTERN, label: formatMessage(messages[MATCHED_PATTERN]) },
  { value: CREATE_PROJECT, label: formatMessage(messages[CREATE_PROJECT]) },
];

const getLaunchGridColumnsOptions = (formatMessage) => [
  { value: 'attributes', label: formatMessage(messages.attributes) },
  { value: 'user', label: formatMessage(messages.user) },
  { value: 'startTime', label: formatMessage(messages.startTime) },
  { value: 'endTime', label: formatMessage(messages.endTime) },
  { value: 'description', label: formatMessage(messages.description) },
];

const getDefectTypesGroupsOptions = (formatMessage) => [
  { value: PRODUCT_BUG, label: formatMessage(defectTypesLocalization[PRODUCT_BUG]) },
  { value: AUTOMATION_BUG, label: formatMessage(defectTypesLocalization[AUTOMATION_BUG]) },
  { value: SYSTEM_ISSUE, label: formatMessage(defectTypesLocalization[SYSTEM_ISSUE]) },
  { value: TO_INVESTIGATE, label: formatMessage(defectTypesLocalization[TO_INVESTIGATE]) },
  { value: NO_DEFECT, label: formatMessage(defectTypesLocalization[NO_DEFECT]) },
];

export const getWidgetCriteriaOptions = (optionGroups, formatMessage, meta) => {
  let options = [];
  optionGroups.forEach((optionGroup) => {
    switch (optionGroup) {
      case LAUNCH_STATUSES_OPTIONS:
        options = options.concat(getLaunchStatusesOptions(formatMessage));
        break;
      case DEFECT_TYPES_OPTIONS:
        options = options.concat(getDefectTypesOptions(meta.defectTypes, formatMessage));
        break;
      case GROUPED_DEFECT_TYPES_OPTIONS:
        options = options.concat(getGroupedDefectTypesOptions(meta.defectTypes, formatMessage));
        break;
      case USER_ACTIONS_OPTIONS:
        options = options.concat(getUserActionOptions(formatMessage));
        break;
      case LAUNCH_GRID_COLUMNS_OPTIONS:
        options = options.concat(getLaunchGridColumnsOptions(formatMessage));
        break;
      case DEFECT_STATISTICS_OPTIONS:
        options = options.concat(getDefectStatisticsOptions(formatMessage));
        break;
      case SKIPPED_FAILED_LAUNCHES_OPTIONS:
        options = options.concat(getSkippedFailedLaunchesOptions(formatMessage));
        break;
      case PASSED_FAILED_LAUNCHES_OPTIONS:
        options = options.concat(getPassedFailedLaunchesOptions(formatMessage));
        break;
      case TO_INVESTIGATE_OPTION:
        options = options.concat(getToInvestigateStatisticsOption(formatMessage));
        break;
      case DEFECT_TYPES_GROUPS_OPTIONS:
        options = options.concat(
          meta?.withoutNoDefect
            ? getDefectTypesGroupsOptions(formatMessage).slice(0, -1)
            : getDefectTypesGroupsOptions(formatMessage),
        );
        break;
      default:
    }
  });
  return options;
};
