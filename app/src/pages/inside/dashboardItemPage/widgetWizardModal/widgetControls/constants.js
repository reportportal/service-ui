import PropTypes from 'prop-types';
import {
  LAUNCH_STATISTICS,
  OVERALL_STATISTICS,
  LAUNCH_DURATION,
  LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
  PROJECT_ACTIVITY,
  TEST_CASES_GROWTH_TREND,
  INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
  LAUNCHES_TABLE,
  UNIQUE_BUGS_TABLE,
  MOST_FAILED_TEST_CASES_TABLE,
  FAILED_CASES_TREND,
  NON_PASSED_TEST_CASES_TREND,
  DIFFERENT_LAUNCHES_COMPARISON,
  PASSING_RATE_PER_LAUNCH,
  PASSING_RATE_SUMMARY,
  FLAKY_TEST_CASES_TABLE,
  CUMULATIVE_TREND,
  PRODUCT_STATUS,
  MOST_TIME_CONSUMING,
} from 'common/constants/widgetTypes';

export const LAUNCH_STATUSES_OPTIONS = 'launchStatusesOptions';
export const DEFECT_TYPES_OPTIONS = 'defectTypesOptions';
export const GROUPED_DEFECT_TYPES_OPTIONS = 'groupedDefectTypesOptions';
export const DEFECT_TYPES_GROUPS_OPTIONS = 'defectTypesGroupsOptions';
export const DEFECT_STATISTICS_OPTIONS = 'defectStatisticsOptions';
export const SKIPPED_FAILED_LAUNCHES_OPTIONS = 'skippedFailedLaunchesOptions';
export const PASSED_FAILED_LAUNCHES_OPTIONS = 'passedFailedLaunchesOptions';
export const USER_ACTIONS_OPTIONS = 'userActionsOptions';
export const LAUNCH_GRID_COLUMNS_OPTIONS = 'launchGridColumnsOptions';
export const TO_INVESTIGATE_OPTION = 'toInvestigateOption';

export const ITEMS_INPUT_WIDTH = 70;

export const CHART_MODES = {
  LAUNCH_MODE: 'launchMode',
  TIMELINE_MODE: 'timelineMode',

  ALL_LAUNCHES: 'allLaunches',
  LATEST_LAUNCHES: 'latestLaunches',

  AREA_VIEW: 'areaView',
  TABLE_VIEW: 'tableView',
  BAR_VIEW: 'barView',
  PANEL_VIEW: 'panelView',
  DONUT_VIEW: 'donutView',
  PIE_VIEW: 'pieView',
};

export const STATIC_CRITERIA = {
  NAME: 'name',
  NUMBER: 'number',
  LAST_MODIFIED: 'last_modified',
  STATUS: 'status',
};

export const METADATA_FIELDS = {
  NAME: 'name',
  NUMBER: 'number',
  START_TIME: 'start_time',
};

export const CONTENT_FIELDS = {
  NAME: 'name',
  NUMBER: 'number',
  STATUS: 'status',
  START_TIME: 'start_time',
  END_TIME: 'end_time',
  USER_REF: 'userRef',
  LAST_MODIFIED: 'last_modified',
  ACTION_TYPE: 'actionType',
  OBJECT_TYPE: 'objectType',
  PROJECT_REF: 'projectRef',
  LOGGED_OBJECT_REF: 'loggedObjectRef',
  HISTORY: 'history',
};

export const requestDataShape = PropTypes.shape({
  filterId: PropTypes.array,
  description: PropTypes.string,
  name: PropTypes.string,
  share: PropTypes.bool,
  widgetType: PropTypes.oneOf([
    LAUNCH_STATISTICS,
    OVERALL_STATISTICS,
    LAUNCH_DURATION,
    LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
    PROJECT_ACTIVITY,
    TEST_CASES_GROWTH_TREND,
    INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
    LAUNCHES_TABLE,
    UNIQUE_BUGS_TABLE,
    MOST_FAILED_TEST_CASES_TABLE,
    FAILED_CASES_TREND,
    NON_PASSED_TEST_CASES_TREND,
    DIFFERENT_LAUNCHES_COMPARISON,
    PASSING_RATE_PER_LAUNCH,
    PASSING_RATE_SUMMARY,
    FLAKY_TEST_CASES_TABLE,
    CUMULATIVE_TREND,
    PRODUCT_STATUS,
    MOST_TIME_CONSUMING,
  ]),
  contentParameters: PropTypes.shape({
    itemsCount: PropTypes.string,
    metadataFields: PropTypes.array,
    contentFields: PropTypes.array,
    widgetOptions: PropTypes.object,
  }),
});
