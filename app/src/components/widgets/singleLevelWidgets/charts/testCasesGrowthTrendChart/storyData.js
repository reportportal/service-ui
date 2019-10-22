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
      projectId: 'default_personal',
    },
  },
  location: {
    pathname: '/default_personal/dashboard',
    type: 'PROJECT_DASHBOARD_PAGE',
    projectId: 'default_personal',
    payload: {
      testItemIds: '1/2',
    },
  },
};

export const widgetData = {
  id: '6',
  name: 'casesTrend',
  description: 'bbbb',
  owner: 'test_testing',
  share: true,
  widgetType: 'casesTrend',
  contentParameters: {
    itemsCount: 50,
    widgetOptions: {
      timeline: 'launch',
    },
  },
  content: {
    result: [
      {
        id: 6,
        number: 6,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: 0,
          statistics$executions$total: 3,
        },
      },
      {
        id: 5,
        number: 5,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: 3,
          statistics$executions$total: 6,
        },
      },
      {
        id: 4,
        number: 4,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: -2,
          statistics$executions$total: 4,
        },
      },
      {
        id: 3,
        number: 3,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: -3,
          statistics$executions$total: 1,
        },
      },
      {
        id: 2,
        number: 2,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: 7,
          statistics$executions$total: 8,
        },
      },
      {
        id: 1,
        number: 1,
        name:
          'Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it_is_correctly_displayed_on_Launches_pages_under_different_browsers_New_Long name of launch name to_be_sure_it',
        startTime: 1541760891421,
        values: {
          delta: 1,
          statistics$executions$total: 9,
        },
      },
    ],
  },
};

export const widgetDataTimelineMode = {
  description: 'desc',
  owner: 'default',
  share: false,
  id: '8',
  name: 'casesTrend_timeline',
  widgetType: 'casesTrend',
  contentParameters: {
    itemsCount: 18,
    widgetOptions: {
      timeline: 'day',
    },
  },
  content: {
    result: {
      '2018-09-21': {
        values: {
          statistics$executions$total: '138',
          delta: '0',
        },
        name: 'Demo Api Tests_dfrt',
        startTime: '1537516124168',
        number: '10',
        id: '5ba4a25c857aba0001b03631',
      },
      '2018-09-22': {
        values: {
          statistics$executions$total: '0',
          delta: '-138',
        },
      },
      '2018-09-23': {
        values: {
          statistics$executions$total: '0',
          delta: '0',
        },
      },
      '2018-09-24': {
        values: {
          statistics$executions$total: '138',
          delta: '138',
        },
        name: 'Demo Api Tests_testdata',
        startTime: '1537793436846',
        number: '10',
        id: '5ba8dd9c857aba0001b0b59f',
      },
    },
  },
};
