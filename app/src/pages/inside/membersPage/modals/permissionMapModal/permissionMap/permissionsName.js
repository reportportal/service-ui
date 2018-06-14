import { defineMessages } from 'react-intl';
import { ACTIONS } from 'common/constants/permissions';

export const ROLE_NAMES = defineMessages({
  role: {
    id: 'PermissionMap.role',
    defaultMessage: 'Action/Project role',
  },
  admin: {
    id: 'PermissionMap.admin',
    defaultMessage: 'Admin',
  },
  manager: {
    id: 'PermissionMap.manager',
    defaultMessage: 'Manager',
  },
  member: {
    id: 'PermissionMap.member',
    defaultMessage: 'Member',
  },
  owner: {
    id: 'PermissionMap.owner',
    defaultMessage: 'Owner',
  },
  notOwner: {
    id: 'PermissionMap.notOwner',
    defaultMessage: 'Not owner',
  },
  operator: {
    id: 'PermissionMap.operator',
    defaultMessage: 'Operator',
  },
  customer: {
    id: 'PermissionMap.customer',
    defaultMessage: 'Customer',
  },
  oneAttention: {
    id: 'PermissionMap.oneAttention',
    defaultMessage: 'Action can be done for a internal user.',
  },
});

export const PERMISSION_NAMES = defineMessages({
  [ACTIONS.ACCESS_TO_MANAGEMENT_SYSTEM]: {
    id: 'PermissionMap.accessToManagementSystem',
    defaultMessage: 'Have access to management system',
  },
  [ACTIONS.CREATE_PROJECT]: {
    id: 'PermissionMap.createProject',
    defaultMessage: 'Create project',
  },
  [ACTIONS.DELETE_PROJECT]: {
    id: 'PermissionMap.deleteProject',
    defaultMessage: 'Delete project',
  },
  [ACTIONS.UPDATE_SETTINGS]: {
    id: 'PermissionMap.updateSettings',
    defaultMessage: 'Update project settings',
  },
  [ACTIONS.SEE_SETTINGS]: {
    id: 'PermissionMap.seeSettings',
    defaultMessage: 'See project settings',
  },
  [ACTIONS.CREATE_INTERNAL_USER]: {
    id: 'PermissionMap.createInternalUser',
    defaultMessage: 'Create internal user',
  },
  [ACTIONS.INVITE_INTERNAL_USER]: {
    id: 'PermissionMap.inviteInternalUser',
    defaultMessage: 'Invite internal user',
  },
  [ACTIONS.ASSIGN_UNASSIGN_INTERNAL_USER]: {
    id: 'PermissionMap.unSlashAssignInternalUser',
    defaultMessage: 'Un/Assign internal user to/from the project',
  },
  [ACTIONS.CHANGE_USER_ROLE]: {
    id: 'PermissionMap.changeUserRole',
    defaultMessage: 'Change users role on a project\t',
  },
  [ACTIONS.DELETE_USER]: {
    id: 'PermissionMap.delUser',
    defaultMessage: 'Delete internal user',
  },
  [ACTIONS.SEE_MEMBERS]: {
    id: 'PermissionMap.seeMembers',
    defaultMessage: 'See list of project members',
  },
  [ACTIONS.EDIT_OWN_ACCOUNT]: {
    id: 'PermissionMap.editOwnAccount1',
    defaultMessage: 'Edit own account',
    attention: true,
  },
  [ACTIONS.DELETE_LAUNCH]: {
    id: 'PermissionMap.deleteLaunch',
    defaultMessage: 'Delete launch',
  },
  [ACTIONS.FORCE_FINISH_LAUNCH]: {
    id: 'PermissionMap.forceFinishLaunch',
    defaultMessage: 'Force finish launch',
  },
  [ACTIONS.START_ANALYSIS]: {
    id: 'PermissionMap.startAnalysis',
    defaultMessage: 'Start analysis manually\t',
  },
  [ACTIONS.DELETE_TEST_ITEM]: {
    id: 'PermissionMap.deleteTestItem',
    defaultMessage: 'Delete test item and log',
  },
  [ACTIONS.MOVE_TO_DEBUG]: {
    id: 'PermissionMap.moveToDebug',
    defaultMessage: 'Move launch to debug/default mode',
  },
  [ACTIONS.MERGE_LAUNCHES]: {
    id: 'PermissionMap.mergeLaunches',
    defaultMessage: 'Merge launches',
  },
  [ACTIONS.WORK_WITH_FILTERS]: {
    id: 'PermissionMap.workWithFiltersEtc',
    defaultMessage: 'Work with filters, widgets, dashboards (create, edit, delete, share)\t',
  },
  [ACTIONS.READ_DATA]: {
    id: 'PermissionMap.readData',
    defaultMessage: 'Read data',
  },
});
