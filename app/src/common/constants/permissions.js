import { PROJECT_MANAGER, OPERATOR, CUSTOMER, MEMBER } from 'common/constants/projectRoles';

export const ALL = 'ALL';
export const OWNER = 'OWNER';

export const ACTIONS = {
  ACCESS_TO_MANAGEMENT_SYSTEM: 'ACCESS_TO_MANAGEMENT_SYSTEM',
  CREATE_PROJECT: 'CREATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SEE_SETTINGS: 'SEE_SETTINGS',
  CREATE_INTERNAL_USER: 'CREATE_INTERNAL_USER',
  INVITE_INTERNAL_USER: 'INVITE_INTERNAL_USER',
  ASSIGN_UNASSIGN_INTERNAL_USER: 'ASSIGN_UNASSIGN_INTERNAL_USER',
  CHANGE_USER_ROLE: 'CHANGE_USER_ROLE',
  DELETE_USER: 'DELETE_USER',
  SEE_MEMBERS: 'SEE_MEMBERS',
  EDIT_OWN_ACCOUNT: 'EDIT_OWN_ACCOUNT',
  DELETE_LAUNCH: 'DELETE_LAUNCH',
  EDIT_LAUNCH: 'EDIT_LAUNCH',
  FORCE_FINISH_LAUNCH: 'FORCE_FINISH_LAUNCH',
  START_ANALYSIS: 'START_ANALYSIS',
  DELETE_TEST_ITEM: 'DELETE_TEST_ITEM',
  MOVE_TO_DEBUG: 'MOVE_TO_DEBUG',
  MERGE_LAUNCHES: 'MERGE_LAUNCHES',
  WORK_WITH_FILTERS: 'WORK_WITH_FILTERS',
  READ_DATA: 'READ_DATA',
};
export const PERMISSIONS_MAP = {
  [PROJECT_MANAGER]: {
    [ACTIONS.UPDATE_SETTINGS]: ALL,
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.INVITE_INTERNAL_USER]: ALL,
    [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: ALL,
    [ACTIONS.CHANGE_USER_ROLE]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.DELETE_LAUNCH]: ALL,
    [ACTIONS.EDIT_LAUNCH]: ALL,
    [ACTIONS.FORCE_FINISH_LAUNCH]: ALL,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: ALL,
    [ACTIONS.MOVE_TO_DEBUG]: ALL,
    [ACTIONS.MERGE_LAUNCHES]: ALL,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
  },
  [MEMBER]: {
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.DELETE_LAUNCH]: OWNER,
    [ACTIONS.EDIT_LAUNCH]: OWNER,
    [ACTIONS.FORCE_FINISH_LAUNCH]: OWNER,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: OWNER,
    [ACTIONS.MOVE_TO_DEBUG]: OWNER,
    [ACTIONS.MERGE_LAUNCHES]: OWNER,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
  },
  [OPERATOR]: {
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.SEE_MEMBERS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
  },
  [CUSTOMER]: {
    [ACTIONS.SEE_SETTINGS]: ALL,
    [ACTIONS.EDIT_OWN_ACCOUNT]: ALL,
    [ACTIONS.DELETE_LAUNCH]: OWNER,
    [ACTIONS.EDIT_LAUNCH]: OWNER,
    [ACTIONS.FORCE_FINISH_LAUNCH]: OWNER,
    [ACTIONS.START_ANALYSIS]: ALL,
    [ACTIONS.DELETE_TEST_ITEM]: OWNER,
    [ACTIONS.MERGE_LAUNCHES]: OWNER,
    [ACTIONS.WORK_WITH_FILTERS]: ALL,
    [ACTIONS.READ_DATA]: ALL,
  },
};
