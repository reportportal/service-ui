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
  location: {
    pathname: '/amsterget_personal/launches/all',
    type: 'PROJECT_LAUNCHES_PAGE',
    payload: {
      projectId: 'amsterget_personal',
      filterId: 'all',
      testItemIds: '1',
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
    '### **Demonstration launch.**↵A typical *Launch structure* comprises the following elements: Suite > Test > Step > Log.↵Launch contains *randomly* generated `suites`, `tests`, `steps` with:↵* random issues and statuses,↵* logs,↵* attachments with different formats.',
  end_time: 1534436199669,
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
  attributes: [
    {
      value: 'desktop',
    },
    {
      value: 'demo',
    },
    {
      key: 'build',
      value: '3.0.1.10',
    },
  ],
  startTime: 1534436195270,
};
