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

export const widgetData = {
  id: '6',
  name: 'uniqueBugTable',
  description: 'bbbb',
  owner: 'test_testing',
  share: true,
  widgetType: 'uniqueBugTable',
  contentParameters: {
    itemsCount: 50,
    contentFields: ['bugID', 'foundIn', 'submitDate', 'submitter'],
    widgetOptions: {
      filterName: 'New_Filter 1',
    },
  },
  content: {
    result: [
      {
        bugID: 'EPMRPP-36793',
        url: 'EPMRPP-36793',
        submitDate: '1539811188656',
        submitter: 'default',
        foundIn: [
          {
            id: '5bbeef4b02743900019af559',
            name: 'checkIsVisibleElementsOnWidgetTypePageSharedWidgetsTab',
            launchId: '5bbeef4702743900019ae89d',
            pathNames: {
              '5bbeef4b02743900019af4b0': 'Widgets',
              '5bbeef4b02743900019af4b1': 'Widget Type Tab',
            },
            attributes: [
              {
                key: 'ios',
                value: 'desktop',
                system: false,
              },
              {
                key: 'desktop',
                value: 'true',
                system: false,
              },
            ],
          },
          {
            id: '5bbeef4b02743900019af48f',
            name: 'testGetSharedWidgetNames',
            launchId: '5bbeef4702743900019ae89d',
            pathNames: {
              '5bbeef4a02743900019af22d': 'Sharing tests',
              '5bbeef4a02743900019af412': 'BasicWidgetSharingTest',
            },
          },
          {
            id: '5bbeef4402743900019add73',
            name: 'testFilterNegative',
            launchId: '5bbeef4702743900019ae89d',
            pathNames: {
              '5bbeef4302743900019adc77': 'Filtering Launch Tests',
              '5bbeef4402743900019add49': 'FilteringLaunchInTagsTest',
            },
          },
          {
            id: '5bbeef4002743900019ad12c',
            name: 'testDefinedSuiteFinishStatus',
            launchId: '5bbeef3e02743900019acbff',
            pathNames: {
              '5bbeef4002743900019ad076': 'Test entity tests',
              '5bbeef4002743900019ad12b': 'ItemStatusTest',
            },
            attributes: [
              {
                key: 'ios',
                value: 'desktop',
                system: false,
              },
              {
                key: 'desktop',
                value: 'true',
                system: false,
              },
            ],
          },
          {
            id: '5bbeef4902743900019aee8b',
            name: 'testDefinedSuiteFinishStatus',
            launchId: '5bbeef4702743900019ae89d',
            pathNames: {
              '5bbeef4902743900019aee1a': 'Test entity tests',
              '5bbeef4902743900019aee89': 'ItemStatusTest',
            },
            attributes: [
              {
                key: 'ios',
                value: 'desktop',
                system: false,
              },
              {
                key: 'desktop',
                value: 'true',
                system: false,
              },
            ],
          },
        ],
      },
      {
        bugID: '1',
        url: '',
        submitter: 'default',
        submitDate: '1539201788078',
        foundIn: [
          {
            id: '5baa153e857aba00011297b5',
            name: 'afterMethod',
            launchId: '5bbe59a402743900019a93c3',
            pathNames: {
              '5baa153e857aba000112987f': 'Filtering Launch Tests',
              '5baa153f857aba0001129a85': 'GetAllTags',
            },
            attributes: [
              {
                key: 'ios',
                value: 'desktop',
                system: false,
              },
              {
                key: 'desktop',
                value: 'true',
                system: false,
              },
            ],
          },
        ],
      },
      {
        bugID: '111',
        url: 'luxoft.com',
        submitDate: '1539202274882',
        submitter: 'default',
        foundIn: [
          {
            id: '5baa153e857aba00011297b5',
            name: 'testStartLaunchMode',
            launchId: '5bbe59a402743900019a93c3',
            pathNames: {
              '5baa153d857aba00011295bb': 'Launch Tests',
              '5baa153e857aba0001129767': 'StartLaunchTest',
            },
          },
        ],
      },
    ],
  },
};
