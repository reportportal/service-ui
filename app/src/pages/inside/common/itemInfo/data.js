/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  user: {
    info: {
      userId: 'default',
      email: 'examle@mail.com',
      photoId: '5b7584da97a1c00001e7fd1f',
      fullName: 'SuperTester',
      accountType: 'INTERNAL',
      userRole: 'ADMINISTRATOR',
      lastLogin: 1534867405428,
      photoLoaded: true,
      defaultProject: 'default_personal',
      assignedProjects: {
        '11111': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        '1111_1111': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        abc: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'ahml-sup': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'UPSA',
        },
        aircraft: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        ak_2_personal_project: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        alex_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'PERSONAL',
        },
        amsterget_personal: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        artem: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'artem-test': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        'bcsl-bqs': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'UPSA',
        },
        copy: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'ddn-repl': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'UPSA',
        },
        default_personal: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        default_project: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        demo4: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        email: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'epm-prmo': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'UPSA',
        },
        'epm-pro': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'UPSA',
        },
        'epm-upsa': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'UPSA',
        },
        extra: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        flacky: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        gnu: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        grow: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        hhh_hhh: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        hhh_jjj: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        hhhh: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        import: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        jobs: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        lexecon_personal: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        nebo_project1: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        nebo_project2: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        nebo_standart: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        'new-project': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'new-project-new': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'new-yana-project': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        newa: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        peppa_star: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        peppastar: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        peppastar_jane: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'pr-1': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'pr-2': {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        'pr-custom-1': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'project-qa': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        project365: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        qwerty: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        'reportportal-user_personal': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        rp_autotest_proj: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        semizarov: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        set4: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        single_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'PERSONAL',
        },
        string: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        superadmin_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'PERSONAL',
        },
        tatyanatest: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        tatyanatest2: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        temporary: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        test2: {
          projectRole: 'MEMBER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        test_user_personal: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        tester_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'PERSONAL',
        },
        testprojectstas: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'INTERNAL',
        },
        testvovan: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        trend: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        tttttttt: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        user105_personal: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        userdiaul7nhzj_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'PERSONAL',
        },
        uservcevkjblbk_personal: {
          projectRole: 'MEMBER',
          proposedRole: 'MEMBER',
          entryType: 'PERSONAL',
        },
        'yana-test': {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        yana_new_project_jjj: {
          projectRole: 'PROJECT_MANAGER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
        yana_project: {
          projectRole: 'MEMBER',
          proposedRole: 'PROJECT_MANAGER',
          entryType: 'INTERNAL',
        },
      },
    },
    activeProject: 'amsterget_personal',
    settings: {
      startTimeFormat: 'relative',
    },
    token: '6c0aaff9-f471-4a07-bad2-78440d4c354b',
  },
  plugins: {
    plugins: [],
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

export const mockData = {
  approximateDuration: 0,
  description:
    'This is a `suite` level. Here you can handle *the aggregated information* per  `suite`.',
  endTime: 1534436199669,
  hasRetries: false,
  id: '5b75a36397a1c00001ea3d4c',
  isProcessing: false,
  mode: 'DEFAULT',
  name: 'Demo Api Tests_090909',
  number: 10,
  owner: 'default',
  share: false,
  statistics: {
    defects: {
      automation_bug: {
        AB001: 11,
        total: 11,
      },
      no_defect: {
        ND001: 0,
        total: 0,
      },
      product_bug: {
        PB001: 15,
        total: 15,
      },
      system_issue: {
        SI001: 8,
        total: 8,
      },
      to_investigate: {
        TI001: 27,
        total: 27,
      },
    },
    executions: {
      failed: '37',
      passed: '84',
      skipped: '17',
      total: '138',
    },
  },
  status: 'FAILED',
  tags: ['desktop', 'demo', 'build:3.0.1.10'],
  startTime: 1534436195270,
};
