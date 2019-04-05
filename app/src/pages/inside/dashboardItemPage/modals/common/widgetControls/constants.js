import PropTypes from 'prop-types';
import * as WIDGET_TYPES from 'common/constants/widgetTypes';

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

export const STATIC_CRITERIA = {
  NAME: 'name',
  NUMBER: 'number',
  LAST_MODIFIED: 'lastModified',
  STATUS: 'status',
};

export const CONTENT_FIELDS = {
  NAME: 'name',
  NUMBER: 'number',
  STATUS: 'status',
  START_TIME: 'startTime',
  END_TIME: 'endTime',
  USER: 'user',
  LAST_MODIFIED: 'lastModified',
  ACTION_TYPE: 'actionType',
  OBJECT_TYPE: 'objectType',
  PROJECT_REF: 'projectRef',
  LOGGED_OBJECT_REF: 'loggedObjectRef',
  HISTORY: 'history',
};

export const requestDataShape = PropTypes.shape({
  filters: PropTypes.array,
  description: PropTypes.string,
  name: PropTypes.string,
  share: PropTypes.bool,
  widgetType: PropTypes.oneOf(Object.keys(WIDGET_TYPES).map((key) => WIDGET_TYPES[key])),
  contentParameters: PropTypes.shape({
    itemsCount: PropTypes.string,
    contentFields: PropTypes.array,
    widgetOptions: PropTypes.object,
  }),
});
