import { defineMessages } from 'react-intl';
import {
  DASHBOARD,
  LAUNCH,
  WIDGET,
  FILTER,
  IMPORT,
  PROJECT,
  DEFECT_TYPE,
  USER,
  USER_FILTER,
  EXTERNAL_SYSTEM,
  TEST_ITEM,
} from 'common/constants/eventsObjectTypes';
import {
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  CREATE_WIDGET,
  UPDATE_WIDGET,
  DELETE_WIDGET,
  CREATE_FILTER,
  UPDATE_FILTER,
  DELETE_FILTER,
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  START_IMPORT,
  FINISH_IMPORT,
  CREATE_USER,
  UPDATE_PROJECT,
  POST_ISSUE,
  LINK_ISSUE,
  UNLINK_ISSUE,
  CREATE_BTS,
  UPDATE_BTS,
  DELETE_BTS,
  UPDATE_ANALYZER,
  GENERATE_INDEX,
  DELETE_INDEX,
  UPDATE_DEFECT,
  DELETE_DEFECT,
  UPDATE_NOTIFICATIONS,
  SWITCH_ON_NOTIFICATIONS,
  SWITCH_OFF_NOTIFICATIONS,
} from 'common/constants/actionTypes';

export const actionMessages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'EventActions.createDashboard',
    defaultMessage: 'Create dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'EventActions.updateDashboard',
    defaultMessage: 'Update dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'EventActions.deleteDashboard',
    defaultMessage: 'Deleted dashboard',
  },
  [CREATE_WIDGET]: {
    id: 'EventActions.createWidget',
    defaultMessage: 'Created widget',
  },
  [UPDATE_WIDGET]: {
    id: 'EventActions.updateWidget',
    defaultMessage: 'Updated widget',
  },
  [DELETE_WIDGET]: {
    id: 'EventActions.deleteWidget',
    defaultMessage: 'Deleted widget',
  },
  [CREATE_FILTER]: {
    id: 'EventActions.createFilter',
    defaultMessage: 'Create filter',
  },
  [UPDATE_FILTER]: {
    id: 'EventActions.updateFilter',
    defaultMessage: 'Update filter',
  },
  [DELETE_FILTER]: {
    id: 'EventActions.deleteFilter',
    defaultMessage: 'Delete filter',
  },
  [START_LAUNCH]: {
    id: 'EventActions.startLaunch',
    defaultMessage: 'Start launch',
  },
  [FINISH_LAUNCH]: {
    id: 'EventActions.finishLaunch',
    defaultMessage: 'Finish launch',
  },
  [DELETE_LAUNCH]: {
    id: 'EventActions.deleteLaunch',
    defaultMessage: 'Delete launch',
  },
  [START_IMPORT]: {
    id: 'EventActions.startImport',
    defaultMessage: 'Start import',
  },
  [FINISH_IMPORT]: {
    id: 'EventActions.finishImport',
    defaultMessage: 'Finish import',
  },
  [CREATE_USER]: {
    id: 'EventActions.CreateUser',
    defaultMessage: 'Create user',
  },
  [UPDATE_PROJECT]: {
    id: 'EventActions.updateProject',
    defaultMessage: 'Update project',
  },
  [POST_ISSUE]: {
    id: 'EventActions.postIssue',
    defaultMessage: 'Post Issue',
  },
  [LINK_ISSUE]: {
    id: 'EventActions.linkIssue',
    defaultMessage: 'Link Issue',
  },
  [UNLINK_ISSUE]: {
    id: 'EventActions.unlinkIssue',
    defaultMessage: 'Unlink issue',
  },
  [CREATE_BTS]: {
    id: 'EventActions.createBts',
    defaultMessage: 'Create BTS',
  },
  [UPDATE_BTS]: {
    id: 'EventActions.updateBts',
    defaultMessage: 'Update BTS',
  },
  [DELETE_BTS]: {
    id: 'EventActions.deleteBts',
    defaultMessage: 'Delete BTS',
  },
  [UPDATE_ANALYZER]: {
    id: 'EventActions.updateAnalyzer',
    defaultMessage: 'Update analyzer',
  },
  [GENERATE_INDEX]: {
    id: 'EventActions.generateIndex',
    defaultMessage: 'Generate index',
  },
  [DELETE_INDEX]: {
    id: 'EventActions.deleteIndex',
    defaultMessage: 'Delete index',
  },
  [UPDATE_DEFECT]: {
    id: 'EventActions.updateDefect',
    defaultMessage: 'Update defect',
  },
  [DELETE_DEFECT]: {
    id: 'EventActions.deleteDefect',
    defaultMessage: 'Delete defect',
  },
  [UPDATE_NOTIFICATIONS]: {
    id: 'EventActions.updateNotifications',
    defaultMessage: 'Update notifications',
  },
  [SWITCH_ON_NOTIFICATIONS]: {
    id: 'EventActions.switchOnNotifications',
    defaultMessage: 'Switch on notifications',
  },
  [SWITCH_OFF_NOTIFICATIONS]: {
    id: 'EventActions.switchOffNotifications',
    defaultMessage: 'Switch off notifications',
  },
});

export const objectTypesMessages = defineMessages({
  [DASHBOARD]: {
    id: 'EventObjectTypes.dashboard',
    defaultMessage: 'Dashboard',
  },
  [LAUNCH]: {
    id: 'EventObjectTypes.launch',
    defaultMessage: 'Launch',
  },
  [WIDGET]: {
    id: 'EventObjectTypes.widget',
    defaultMessage: 'Widget',
  },
  [FILTER]: {
    id: 'EventObjectTypes.filter',
    defaultMessage: 'Filter',
  },
  [IMPORT]: {
    id: 'EventObjectTypes.import',
    defaultMessage: 'Import',
  },
  [PROJECT]: {
    id: 'EventObjectTypes.project',
    defaultMessage: 'Project',
  },
  [DEFECT_TYPE]: {
    id: 'EventObjectTypes.defectType',
    defaultMessage: 'DefectType',
  },
  [USER]: {
    id: 'EventObjectTypes.user',
    defaultMessage: 'User',
  },
  [USER_FILTER]: {
    id: 'EventObjectTypes.userFilter',
    defaultMessage: 'User filter',
  },
  [EXTERNAL_SYSTEM]: {
    id: 'EventObjectTypes.externalSystem',
    defaultMessage: 'External system',
  },
  [TEST_ITEM]: {
    id: 'EventObjectTypes.testItem',
    defaultMessage: 'Test item',
  },
});
