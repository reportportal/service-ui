export const PermissionsConfig = {
  accessToManagementSystem: {
    permissions: [true, false, false, false, false, false, false],
  },
  createProject: {
    permissions: [true, false, false, false, false, false, false],
  },
  deleteProject: {
    permissions: [true, false, false, false, false, false, false],
  },
  updateSettings: {
    permissions: [true, true, false, false, false, false, false],
  },
  seeSettings: {
    permissions: [true, true, true, true, true, true, true],
  },
  createInternalUser: {
    permissions: [true, false, false, false, false, false, false],
  },
  inviteInternalUser: {
    permissions: [true, true, false, false, false, false, false],
  },
  unSlashAssignInternalUser: {
    permissions: [true, true, false, false, false, false, false],
  },
  changeUserRole: {
    permissions: [true, true, false, false, false, false, false],
  },
  delUser: {
    permissions: [true, false, false, false, false, false, false],
  },
  seeMembers: {
    permissions: [true, true, true, true, true, false, false],
  },
  editOwnAccount1: {
    permissions: [true, true, true, true, true, true, true],
    attention: true,
  },
  deleteLaunch: {
    permissions: [true, true, true, false, false, true, false],
  },
  forceFinishLaunch: {
    permissions: [true, true, true, false, true, true, false],
  },
  startAnalysis: {
    permissions: [true, true, true, true, true, true, true],
  },
  deleteTestItem: {
    permissions: [true, true, true, false, false, true, false],
  },
  moveToDebug: {
    permissions: [true, true, true, false, false, false, false],
  },
  mergeLaunches: {
    permissions: [true, true, true, false, true, true, false],
  },
  workWithFiltersEtc: {
    permissions: [true, true, true, true, true, true, true],
  },
  readData: {
    permissions: [true, true, true, true, true, true, true],
  },
};
