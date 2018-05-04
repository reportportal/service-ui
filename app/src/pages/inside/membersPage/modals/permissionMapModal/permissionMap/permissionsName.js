import { defineMessages } from 'react-intl';

export const RolesName = defineMessages({
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

export const PermissionsName = defineMessages({
  accessToManagementSystem: {
    id: 'PermissionMap.accessToManagementSystem',
    defaultMessage: 'Have access to management system',
  },
  createProject: {
    id: 'PermissionMap.createProject',
    defaultMessage: 'Create project',
  },
  deleteProject: {
    id: 'PermissionMap.deleteProject',
    defaultMessage: 'Delete project',
  },
  updateSettings: {
    id: 'PermissionMap.updateSettings',
    defaultMessage: 'Update project settings',
  },
  seeSettings: {
    id: 'PermissionMap.seeSettings',
    defaultMessage: 'See project settings',
  },
  createInternalUser: {
    id: 'PermissionMap.createInternalUser',
    defaultMessage: 'Create internal user',
  },
  inviteInternalUser: {
    id: 'PermissionMap.inviteInternalUser',
    defaultMessage: 'Invite internal user',
  },
  unSlashAssignInternalUser: {
    id: 'PermissionMap.unSlashAssignInternalUser',
    defaultMessage: 'Un/Assign internal user to/from the project',
  },
  changeUserRole: {
    id: 'PermissionMap.changeUserRole',
    defaultMessage: 'Change users role on a project\t',
  },
  delUser: {
    id: 'PermissionMap.delUser',
    defaultMessage: 'Delete internal user',
  },
  seeMembers: {
    id: 'PermissionMap.seeMembers',
    defaultMessage: 'See list of project members',
  },
  editOwnAccount1: {
    id: 'PermissionMap.editOwnAccount1',
    defaultMessage: 'Edit own account',
    attention: true,
  },
  deleteLaunch: {
    id: 'PermissionMap.deleteLaunch',
    defaultMessage: 'Delete launch',
  },
  forceFinishLaunch: {
    id: 'PermissionMap.forceFinishLaunch',
    defaultMessage: 'Force finish launch',
  },
  startAnalysis: {
    id: 'PermissionMap.startAnalysis',
    defaultMessage: 'Start analysis manually\t',
  },
  deleteTestItem: {
    id: 'PermissionMap.deleteTestItem',
    defaultMessage: 'Delete test item and log',
  },
  moveToDebug: {
    id: 'PermissionMap.moveToDebug',
    defaultMessage: 'Move launch to debug/default mode',
  },
  mergeLaunches: {
    id: 'PermissionMap.mergeLaunches',
    defaultMessage: 'Merge launches',
  },
  workWithFiltersEtc: {
    id: 'PermissionMap.workWithFiltersEtc',
    defaultMessage: 'Work with filters, widgets, dashboards (create, edit, delete, share)\t',
  },
  readData: {
    id: 'PermissionMap.readData',
    defaultMessage: 'Read data',
  },
});
