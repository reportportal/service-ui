export const state = {
  user: {
    info: {
      id: 1,
      userId: 'superadmin',
      email: 'superadminemail@domain.com',
      photoId: 'L2RhdGEvc3RvcmFnZS9zdXBlcmFkbWlu',
      fullName: 'tester',
      accountType: 'INTERNAL',
      userRole: 'ADMINISTRATOR',
      photoLoaded: true,
      metadata: {
        last_login: 1552559284869,
      },
      assignedProjects: {
        admin_personal: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        testlongname_personal: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        tester_personal: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        superadmin_personal: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        admin_personal_1: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        test352041_personal: {
          projectRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
      },
    },
    activeProject: 'superadmin_personal',
    settings: {
      startTimeFormat: 'relative',
      photoTimeStamp: 1552561241887,
    },
    token: '09b8b872-64fb-42fb-8906-32ff23af1eea',
  },
  location: {
    pathname: '/api',
    type: 'API_PAGE',
    payload: {},
    prev: {
      pathname: '/superadmin_personal/launches/all',
      type: 'PROJECT_LAUNCHES_PAGE',
      payload: {
        projectId: 'superadmin_personal',
        filterId: 'all',
      },
    },
    kind: 'push',
    routesMap: {
      HOME_PAGE: {
        path: '/',
      },
      LOGIN_PAGE: '/login',
      REGISTRATION_PAGE: '/registration',
      undefined: '/notfound',
      ADMINISTRATE_PAGE: {
        path: '/administrate',
      },
      USER_PROFILE_PAGE: '/user-profile',
      API_PAGE: '/api',
      PROJECTS_PAGE: {
        path: '/administrate/projects',
      },
      PROJECT_DETAILS_PAGE: {
        path:
          '/administrate/projects/:projectId/:projectSection(settings|members|events)?/:settingsTab?',
      },
      ALL_USERS_PAGE: {
        path: '/administrate/users',
      },
      SERVER_SETTINGS_PAGE: {
        path: '/administrate/settings',
      },
      SERVER_SETTINGS_TAB_PAGE: '/administrate/settings/:settingsTab',
      PLUGINS_PAGE: '/administrate/plugins',
      PROJECT_PAGE: {
        path: '/:projectId',
      },
      PROJECT_DASHBOARD_PAGE: {
        path: '/:projectId/dashboard',
      },
      PROJECT_DASHBOARD_ITEM_PAGE: {
        path: '/:projectId/dashboard/:dashboardId',
      },
      LAUNCHES_PAGE: {
        path: '/:projectId/launches',
      },
      PROJECT_LAUNCHES_PAGE: {
        path: '/:projectId/launches/:filterId',
      },
      HISTORY_PAGE: {
        path: '/:projectId/launches/:filterId/:testItemIds+/history',
      },
      PROJECT_FILTERS_PAGE: {
        path: '/:projectId/filters',
      },
      PROJECT_LOG_PAGE: {
        path: '/:projectId/launches/:filterId/:testItemIds+/log',
      },
      PROJECT_USERDEBUG_LOG_PAGE: {
        path: '/:projectId/userdebug/:filterId/:testItemIds+/log',
      },
      PROJECT_USERDEBUG_PAGE: {
        path: '/:projectId/userdebug/:filterId',
      },
      PROJECT_USERDEBUG_TEST_ITEM_PAGE: {
        path: '/:projectId/userdebug/:filterId/:testItemIds+',
      },
      PROJECT_MEMBERS_PAGE: {
        path: '/:projectId/members',
      },
      PROJECT_SETTINGS_PAGE: {
        path: '/:projectId/settings',
      },
      PROJECT_SETTINGS_TAB_PAGE: '/:projectId/settings/:settingsTab',
      PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
      TEST_ITEM_PAGE: {
        path: '/:projectId/launches/:filterId/:testItemIds+',
      },
    },
  },
};
export const mockData = {
  project: {
    creationDate: 1534940618580,
    entryType: 'UPSA',
    lastRun: 1551191943022,
    launchesQuantity: 18,
    id: '1',
    projectName: 'superadmin_personal',
    organization: 'EPAM',
    usersQuantity: 2,
  },
};
