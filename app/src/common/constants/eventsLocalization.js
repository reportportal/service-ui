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
  EMAIL_CONFIG,
  ITEM_ISSUE,
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
  CREATE_DEFECT,
  UPDATE_DEFECT,
  DELETE_DEFECT,
  POST_ISSUE,
  LINK_ISSUE,
  UPDATE_ANALYZER,
  CREATE_BTS,
  UPDATE_BTS,
  DELETE_BTS,
  GENERATE_INDEX,
  UPDATE_ITEM,
} from 'common/constants/actionTypes';

export const actionMessages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'EventActions.createDashboard',
    defaultMessage: 'created dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'EventActions.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'EventActions.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  [CREATE_WIDGET]: {
    id: 'EventActions.createWidget',
    defaultMessage: 'created widget',
  },
  [UPDATE_WIDGET]: {
    id: 'EventActions.updateWidget',
    defaultMessage: 'updated widget',
  },
  [DELETE_WIDGET]: {
    id: 'EventActions.deleteWidget',
    defaultMessage: 'deleted widget',
  },
  [CREATE_FILTER]: {
    id: 'EventActions.createFilter',
    defaultMessage: 'create filter',
  },
  [UPDATE_FILTER]: {
    id: 'EventActions.updateFilter',
    defaultMessage: 'update filter',
  },
  [DELETE_FILTER]: {
    id: 'EventActions.deleteFilter',
    defaultMessage: 'delete filter',
  },
  [START_LAUNCH]: {
    id: 'EventActions.startLaunch',
    defaultMessage: 'start launch',
  },
  [FINISH_LAUNCH]: {
    id: 'EventActions.finishLaunch',
    defaultMessage: 'finish launch',
  },
  [DELETE_LAUNCH]: {
    id: 'EventActions.deleteLaunch',
    defaultMessage: 'delete launch',
  },
  [START_IMPORT]: {
    id: 'EventActions.startImport',
    defaultMessage: 'start import',
  },
  [FINISH_IMPORT]: {
    id: 'EventActions.finishImport',
    defaultMessage: 'finish import',
  },
  [CREATE_USER]: {
    id: 'EventActions.createUser',
    defaultMessage: 'create user',
  },
  [UPDATE_PROJECT]: {
    id: 'EventActions.updateProject',
    defaultMessage: 'update project',
  },
  [UPDATE_DEFECT]: {
    id: 'EventActions.updateDefect',
    defaultMessage: 'update defect',
  },
  [DELETE_DEFECT]: {
    id: 'EventActions.deleteDefect',
    defaultMessage: 'delete defect',
  },
  [POST_ISSUE]: {
    id: 'EventActions.postIssue',
    defaultMessage: 'post issue',
  },
  [LINK_ISSUE]: {
    id: 'EventActions.linkIssue',
    defaultMessage: 'link issue',
  },
  [CREATE_BTS]: {
    id: 'EventActions.createBts',
    defaultMessage: 'create bts',
  },
  [UPDATE_BTS]: {
    id: 'EventActions.updateBts',
    defaultMessage: 'update bts',
  },
  [DELETE_BTS]: {
    id: 'EventActions.deleteBts',
    defaultMessage: 'delete bts',
  },
  [UPDATE_ANALYZER]: {
    id: 'EventActions.updateAnalyzer',
    defaultMessage: 'update analizer',
  },
  [GENERATE_INDEX]: {
    id: 'EventActions.generateIndex',
    defaultMessage: 'generate index',
  },
  [CREATE_DEFECT]: {
    id: 'EventActions.createDefect',
    defaultMessage: 'create defect',
  },
  [UPDATE_ITEM]: {
    id: 'EventActions.updateItem',
    defaultMessage: 'update item',
  },
});

export const objectTypesMessages = defineMessages({
  [DASHBOARD]: {
    id: 'EventObjectTypes.dashboard',
    defaultMessage: 'dashboard',
  },
  [LAUNCH]: {
    id: 'EventObjectTypes.launch',
    defaultMessage: 'launch',
  },
  [WIDGET]: {
    id: 'EventObjectTypes.widget',
    defaultMessage: 'widget',
  },
  [FILTER]: {
    id: 'EventObjectTypes.filter',
    defaultMessage: 'filter',
  },
  [IMPORT]: {
    id: 'EventObjectTypes.import',
    defaultMessage: 'import',
  },
  [PROJECT]: {
    id: 'EventObjectTypes.project',
    defaultMessage: 'project',
  },
  [DEFECT_TYPE]: {
    id: 'EventObjectTypes.defectType',
    defaultMessage: 'defectType',
  },
  [USER]: {
    id: 'EventObjectTypes.user',
    defaultMessage: 'user',
  },
  [EMAIL_CONFIG]: {
    id: 'EventObjectTypes.emailConfig',
    defaultMessage: 'email config',
  },
  [ITEM_ISSUE]: {
    id: 'EventObjectTypes.itemIssue',
    defaultMessage: 'Test item',
  },
  [TEST_ITEM]: {
    id: 'EventObjectTypes.testItem',
    defaultMessage: 'Test item',
  },
});
