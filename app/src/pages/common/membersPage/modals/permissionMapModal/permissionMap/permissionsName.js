import { defineMessages } from 'react-intl';
import { ACTIONS } from './permissions';

const CATEGORIES = {
  PROJECT: 'PROJECT',
  MEMBERS: 'MEMBERS',
  LAUNCHES: 'LAUNCHES',
  SUITE_TEST_TEST_ITEM: 'SUITE_TEST_TEST_ITEM',
  WIDGET_FILTER_DASHBOARD: 'WIDGET_FILTER_DASHBOARD',
};

export const ROLE_NAMES = defineMessages({
  role: {
    id: 'PermissionMap.role',
    defaultMessage: 'Action / Project role',
  },
  admin: {
    id: 'PermissionMap.admin',
    defaultMessage: 'Admin',
  },
  manager: {
    id: 'PermissionMap.manager',
    defaultMessage: 'PM',
  },
  member: {
    id: 'PermissionMap.member',
    defaultMessage: 'Member',
  },
  operator: {
    id: 'PermissionMap.operator',
    defaultMessage: 'Operator',
  },
  customer: {
    id: 'PermissionMap.customer',
    defaultMessage: 'Customer',
  },
  attention: {
    id: 'PermissionMap.attention',
    defaultMessage: 'User with Admin role can perform all operations.',
  },
  ownTitle: {
    id: 'PermissionMap.ownTitle',
    defaultMessage: 'Own item',
  },
  notOwnTitle: {
    id: 'PermissionMap.notOwnTitle',
    defaultMessage: 'Not own item',
  },
  ownLegend: {
    id: 'PermissionMap.ownLegend',
    defaultMessage: 'Own item is created by user himself',
  },
  notOwnLegend: {
    id: 'PermissionMap.notOwnLegend',
    defaultMessage: 'Not own item is created by another person',
  },
});

export const PERMISSION_CATEGORIES = defineMessages({
  [CATEGORIES.PROJECT]: {
    id: 'PermissionMap.projectManagement',
    defaultMessage: 'Project management',
  },
  [CATEGORIES.MEMBERS]: {
    id: 'PermissionMap.projectMembers',
    defaultMessage: 'Project members',
  },
  [CATEGORIES.LAUNCHES]: {
    id: 'PermissionMap.launches',
    defaultMessage: 'Launches',
  },
  [CATEGORIES.SUITE_TEST_TEST_ITEM]: {
    id: 'PermissionMap.suiteTestTestItem',
    defaultMessage: 'Suite / test / test item',
  },
  [CATEGORIES.WIDGET_FILTER_DASHBOARD]: {
    id: 'PermissionMap.widgetFilterDashboard',
    defaultMessage: 'Widgets / filters / dashboards',
  },
});

const projectMessages = defineMessages({
  [ACTIONS.EDIT_SETTINGS]: {
    id: 'PermissionMap.editProjectSettings',
    defaultMessage: 'Edit project settings',
  },
});

const membersMessages = defineMessages({
  [ACTIONS.ACTIONS_WITH_MEMBERS]: {
    id: 'PermissionMap.actionsWithMembers',
    defaultMessage: 'Actions with members (invite, assign/unassign, update roles)',
  },
  [ACTIONS.VIEW_INFO_ABOUT_MEMBERS]: {
    id: 'PermissionMap.viewInfoAboutMembers',
    defaultMessage: 'View info about project members',
  },
});

const launchesMessages = defineMessages({
  [ACTIONS.REPORT_LAUNCH]: {
    id: 'PermissionMap.reportLaunch',
    defaultMessage: 'Report launches',
  },
  [ACTIONS.VIEW_LAUNCH_IN_DEBUG_MODE]: {
    id: 'PermissionMap.viewLaunchInDebugMode',
    defaultMessage: 'View launches in debug mode',
  },
  [ACTIONS.MOVE_LAUNCH_TO_DEBUG_DEFAULT]: {
    id: 'PermissionMap.moveLaunchToDebugDefault',
    defaultMessage: 'Move launches to debug/default',
  },
  [ACTIONS.ACTIONS_WITH_LAUNCH]: {
    id: 'PermissionMap.actionsWithLaunch',
    defaultMessage: 'Actions with launches (edit, force finish, merge, delete)',
  },
  [ACTIONS.MANUAL_ANALYSIS_EXPORT_COMPARE_IMPORT]: {
    id: 'PermissionMap.manualAnalysisExportCompareImport',
    defaultMessage: 'Manual analysis, export, compare, import functionalities',
  },
});

const suiteTestTestItemMessages = defineMessages({
  [ACTIONS.ACTIONS_WITH_ITEM]: {
    id: 'PermissionMap.actionsWithItem',
    defaultMessage: 'Actions with item (edit, delete)',
  },
  [ACTIONS.INVESTIGATION_ACTIONS]: {
    id: 'PermissionMap.investigationActions',
    defaultMessage: 'Investigation actions (defect types and issues in BTS)',
  },
});

const widgetFilterDashboardMessages = defineMessages({
  [ACTIONS.CREATE_SHARE_ITEM]: {
    id: 'PermissionMap.createShareItem',
    defaultMessage: 'Create, share item',
  },
  [ACTIONS.EDIT_SHARED_ITEM]: {
    id: 'PermissionMap.editSharedItem',
    defaultMessage: 'Edit shared item',
  },
  [ACTIONS.DELETE_SHARED_ITEM]: {
    id: 'PermissionMap.deleteSharedItem',
    defaultMessage: 'Delete shared item',
  },
});

export const PERMISSION_NAMES = {
  [CATEGORIES.PROJECT]: projectMessages,

  [CATEGORIES.MEMBERS]: membersMessages,

  [CATEGORIES.LAUNCHES]: launchesMessages,

  [CATEGORIES.SUITE_TEST_TEST_ITEM]: suiteTestTestItemMessages,

  [CATEGORIES.WIDGET_FILTER_DASHBOARD]: widgetFilterDashboardMessages,
};
