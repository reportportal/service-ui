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

export const mockEntries = [
  {
    launchNumber: '10',
    startTime: '1534436195270',
    launchId: '5b75a36397a1c00001ea3d4c',
    resources: [
      {
        id: '5b75a36397a1c00001ea3d4f',
        name: 'beforeClass',
        description:
          'Clear all created and not deleted during test *userFilter*, *widget* and *dashboard* objects.',
        tags: ['api', 'ios', 'android'],
        type: 'BEFORE_CLASS',
        startTime: 1534436195277,
        endTime: 1534436195280,
        status: 'PASSED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 0,
              PB001: 0,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a36397a1c00001ea3d4e',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        hasChildren: false,
        launchId: '5b75a36397a1c00001ea3d4c',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '9',
    startTime: '1534436191241',
    launchId: '5b75a35f97a1c00001ea2f96',
    resources: [],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '8',
    startTime: '1534436186826',
    launchId: '5b75a35a97a1c00001ea2223',
    resources: [
      {
        id: '5b75a35a97a1c00001ea2226',
        name: 'beforeClass',
        description:
          'This is the last **test case** of demo launch. There are only `logs` with `attachments` inside it.',
        tags: ['api', 'ios', 'android'],
        type: 'BEFORE_CLASS',
        startTime: 1534436186834,
        endTime: 1534436186837,
        status: 'PASSED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 0,
              PB001: 0,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a35a97a1c00001ea2225',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        hasChildren: false,
        launchId: '5b75a35a97a1c00001ea2223',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '7',
    startTime: '1534436182228',
    launchId: '5b75a35697a1c00001ea13d7',
    resources: [
      {
        id: '5b75a35697a1c00001ea13da',
        name: 'beforeClass',
        description:
          'Clear all created and not deleted during test *userFilter*, *widget* and *dashboard* objects.',
        tags: ['ios', 'android', 'flaky'],
        type: 'BEFORE_CLASS',
        startTime: 1534436182235,
        endTime: 1534436182238,
        status: 'FAILED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 1,
              PB001: 1,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a35697a1c00001ea13d9',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        issue: {
          issueType: 'PB001',
          autoAnalyzed: false,
          ignoreAnalyzer: false,
        },
        hasChildren: false,
        launchId: '5b75a35697a1c00001ea13d7',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '6',
    startTime: '1534436178022',
    launchId: '5b75a35297a1c00001ea0634',
    resources: [
      {
        id: '5b75a35297a1c00001ea0637',
        name: 'beforeClass',
        description:
          'Greater or equals filter test for test items product bugs criteria. Negative value',
        tags: ['most failed', 'longest', 'most stable'],
        type: 'BEFORE_CLASS',
        startTime: 1534436178029,
        endTime: 1534436178032,
        status: 'PASSED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 0,
              PB001: 0,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a35297a1c00001ea0636',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        hasChildren: false,
        launchId: '5b75a35297a1c00001ea0634',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '5',
    startTime: '1534436174199',
    launchId: '5b75a34e97a1c00001e9f9fb',
    resources: [],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '4',
    startTime: '1534436171686',
    launchId: '5b75a34b97a1c00001e9f247',
    resources: [
      {
        id: '5b75a34b97a1c00001e9f24a',
        name: 'beforeClass',
        description:
          'Clear all created and not deleted during test *userFilter*, *widget* and *dashboard* objects.',
        tags: ['most failed', 'longest', 'most stable'],
        type: 'BEFORE_CLASS',
        startTime: 1534436171693,
        endTime: 1534436171696,
        status: 'PASSED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 0,
              PB001: 0,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a34b97a1c00001e9f249',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        hasChildren: false,
        launchId: '5b75a34b97a1c00001e9f247',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '3',
    startTime: '1534436170154',
    launchId: '5b75a34a97a1c00001e9edad',
    resources: [],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '2',
    startTime: '1534436169374',
    launchId: '5b75a34997a1c00001e9eb83',
    resources: [],
    launchStatus: 'FAILED',
  },
  {
    launchNumber: '1',
    startTime: '1534436169102',
    launchId: '5b75a34997a1c00001e9eaef',
    resources: [
      {
        id: '5b75a34997a1c00001e9eaf2',
        name: 'beforeClass',
        description:
          'Greater or equals filter test for test items product bugs criteria. Negative value',
        tags: ['most failed', 'longest', 'most stable'],
        type: 'BEFORE_CLASS',
        startTime: 1534436169110,
        endTime: 1534436169113,
        status: 'PASSED',
        statistics: {
          executions: {
            total: '0',
            passed: '0',
            failed: '0',
            skipped: '0',
          },
          defects: {
            product_bug: {
              total: 0,
              PB001: 0,
            },
            automation_bug: {
              AB001: 0,
              total: 0,
            },
            system_issue: {
              total: 0,
              SI001: 0,
            },
            to_investigate: {
              total: 0,
              TI001: 0,
            },
            no_defect: {
              ND001: 0,
              total: 0,
            },
          },
        },
        parent: '5b75a34997a1c00001e9eaf1',
        pathNames: {
          launchPathName: {
            name: 'Nested Steps Launch',
            number: 1,
          },
          itemPaths: [
            { id: '5b75a36397a1c00001ea3d4d', name: 'Launch Tests' },
            { id: '5b75a36397a1c00001ea3d4e', name: 'UpdateLaunchTest' },
          ],
        },
        launchStatus: 'FAILED',
        hasChildren: false,
        launchId: '5b75a34997a1c00001e9eaef',
        uniqueId: 'auto:6ae7751a200b7ff10dbdc9ed0521d2ce',
      },
    ],
    launchStatus: 'FAILED',
  },
];
