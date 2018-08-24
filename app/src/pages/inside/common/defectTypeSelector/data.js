export const state = {
  project: {
    info: {
      configuration: {
        externalSystem: [],
        entryType: 'PERSONAL',
        statisticCalculationStrategy: 'STEP_BASED',
        projectSpecific: 'DEFAULT',
        interruptedJob: '1 day',
        keepLogs: '3 months',
        keepScreenshots: '2 weeks',
        emailConfiguration: {
          emailEnabled: false,
          fromAddress: 'reportportal@example.com',
          emailCases: [
            {
              recipients: ['OWNER'],
              sendCase: 'ALWAYS',
              launchNames: [],
              tags: [],
            },
          ],
        },
        analyzerConfiguration: {
          minDocFreq: 1,
          minTermFreq: 1,
          minShouldMatch: 95,
          numberOfLogLines: -1,
          isAutoAnalyzerEnabled: true,
          analyzer_mode: 'LAUNCH_NAME',
          indexing_running: false,
        },
        subTypes: {
          TO_INVESTIGATE: [
            {
              locator: 'TI001',
              typeRef: 'TO_INVESTIGATE',
              longName: 'To Investigate',
              shortName: 'TI',
              color: '#ffb743',
            },
          ],
          NO_DEFECT: [
            {
              locator: 'ND001',
              typeRef: 'NO_DEFECT',
              longName: 'No Defect',
              shortName: 'ND',
              color: '#777777',
            },
          ],
          AUTOMATION_BUG: [
            {
              locator: 'AB001',
              typeRef: 'AUTOMATION_BUG',
              longName: 'Automation Bug',
              shortName: 'AB',
              color: '#f7d63e',
            },
            {
              locator: 'ab_1h7inqu51mgys',
              typeRef: 'AUTOMATION_BUG',
              longName: 'NewAB',
              shortName: 'NAB',
              color: '#e6ee9c',
            },
            {
              locator: 'ab_qecoiezu7sc8',
              typeRef: 'AUTOMATION_BUG',
              longName: 'New2AB',
              shortName: 'NAB2',
              color: '#ffcc80',
            },
            {
              locator: 'ab_1k1tyymqtlp46',
              typeRef: 'AUTOMATION_BUG',
              longName: 'New3AB',
              shortName: 'NAB3',
              color: '#ffab91',
            },
          ],
          PRODUCT_BUG: [
            {
              locator: 'PB001',
              typeRef: 'PRODUCT_BUG',
              longName: 'Product Bug',
              shortName: 'PB',
              color: '#ec3900',
            },
          ],
          SYSTEM_ISSUE: [
            {
              locator: 'SI001',
              typeRef: 'SYSTEM_ISSUE',
              longName: 'System Issue',
              shortName: 'SI',
              color: '#0274d1',
            },
          ],
        },
      },
    },
  },
  location: {
    pathname: '/amsterget_personal/launches/all',
    type: 'PROJECT_LAUNCHES_PAGE',
    payload: {
      projectId: 'amsterget_personal',
      filterId: 'all',
    },
    prev: {
      pathname: '/amsterget_personal/dashboard',
      type: 'PROJECT_DASHBOARD_PAGE',
      payload: {
        projectId: 'amsterget_personal',
      },
      query: {},
    },
    kind: 'push',
    routesMap: {
      HOME_PAGE: {
        path: '/',
      },
      LOGIN_PAGE: '/login',
      REGISTRATION_PAGE: '/registration',
      ADMINISTRATE_PAGE: '/administrate',
      USER_PROFILE_PAGE: '/user-profile',
      API_PAGE: '/api',
      PROJECT_PAGE: {
        path: '/:projectId',
      },
      PROJECT_DASHBOARD_PAGE: {
        path: '/:projectId/dashboard',
      },
      PROJECT_DASHBOARD_ITEM_PAGE: {
        path: '/:projectId/dashboard/:dashboardId',
      },
      PROJECT_LAUNCHES_PAGE: {
        path: '/:projectId/launches/:filterId?',
      },
      PROJECT_FILTERS_PAGE: {
        path: '/:projectId/filters',
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
      PROJECT_SETTINGS_TAB_PAGE: '/:projectId/settings/:settingTab',
      PROJECT_SANDBOX_PAGE: '/:projectId/sandbox',
      TEST_ITEM_PAGE: {
        path: '/:projectId/launches/:filterId/:testItemIds+',
      },
    },
  },
};
