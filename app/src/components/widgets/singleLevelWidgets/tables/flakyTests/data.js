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

import { START_TIME_FORMAT_RELATIVE } from 'controllers/user';

export const state = {
  user: {
    settings: {
      startTimeFormat: START_TIME_FORMAT_RELATIVE,
    },
  },
};

export const flakyTests = {
  content: {
    latestLaunch: {
      name: 'Demo Api Tests_test2',
      number: '7',
      id: '59f9af3108813b00015560a9',
    },
    flaky: [
      {
        uniqueId: 'auto:c6be22c35d9f4573ef5137c66466cd26',
        total: 7,
        itemName: 'beforeMethod',
        endTime: 1509535540564,
        percentage: '85.71%',
        flakyCount: 6,
        statuses: [
          'PASSED',
          'PASSED',
          'SKIPPED',
          'PASSED',
          'FAILED',
          'SKIPPED',
          'PASSED',
          'FAILED',
        ],
      },
      {
        uniqueId: 'auto:3f343cf0af3d84fbc6ee50a84231ea87',
        total: 7,
        itemName: 'afterMethod',
        endTime: 1509535539539,
        flakyCount: 6,
        statuses: ['FAILED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'FAILED', 'SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:504984c34dac2f78636f01fd01c13e9a',
        total: 6,
        itemName: 'beforeMethod',
        endTime: 1509535546061,
        flakyCount: 4,
        statuses: ['FAILED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'FAILED', 'FAILED'],
      },
      {
        uniqueId: 'auto:b094547a0db7b1dc6d6f9366900922bc',
        total: 4,
        itemName: 'afterMethod',
        endTime: 1509535545071,
        flakyCount: 3,
        statuses: ['FAILED', 'FAILED', 'PASSED', 'FAILED', 'PASSED'],
      },
      {
        uniqueId: 'auto:cb1fd405c0d304c68661b1ccbd2bc150',
        total: 4,
        itemName: 'afterMethod',
        endTime: 1509535538139,
        flakyCount: 3,
        statuses: ['PASSED', 'SKIPPED', 'SKIPPED', 'PASSED', 'SKIPPED'],
      },
      {
        uniqueId: 'auto:51a34be54c7b6a16afcbdb0937061104',
        total: 7,
        itemName: 'beforeMethod',
        endTime: 1509535539986,
        flakyCount: 3,
        statuses: ['SKIPPED', 'PASSED', 'FAILED', 'FAILED', 'PASSED', 'PASSED', 'PASSED', 'PASSED'],
      },
      {
        uniqueId: 'auto:e8d4c6d1677cdb8d1a33a558b77fa616',
        total: 2,
        itemName: 'beforeMethod',
        endTime: 1509535516176,
        flakyCount: 2,
        statuses: ['PASSED', 'SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:b8e7284521276117bc0dfa57b0585c2b',
        total: 3,
        itemName: 'negativeDataFinishTestItem',
        endTime: 1509535541835,
        flakyCount: 2,
        statuses: ['PASSED', 'PASSED', 'FAILED', 'SKIPPED'],
      },
      {
        uniqueId: 'auto:0cedc334308ca15db8335da8fa4f1534',
        total: 3,
        itemName: 'beforeMethod',
        endTime: 1509535542459,
        flakyCount: 2,
        statuses: ['FAILED', 'PASSED', 'PASSED', 'FAILED'],
      },
      {
        uniqueId: 'auto:5dffde3f42ac6a5f232850681c76a880',
        total: 4,
        itemName: 'afterMethod',
        endTime: 1509535541711,
        flakyCount: 2,
        statuses: ['PASSED', 'PASSED', 'PASSED', 'SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:6d13dc2f01ccda753990b4a98c7a108b',
        total: 4,
        itemName: 'afterMethod',
        endTime: 1509535539038,
        flakyCount: 2,
        statuses: ['PASSED', 'PASSED', 'SKIPPED', 'PASSED', 'PASSED'],
      },
      {
        uniqueId: 'auto:28cee9b88bd100c06bdbdf7fcac06b67',
        total: 1,
        itemName: 'afterClass',
        endTime: 1509535540281,
        flakyCount: 1,
        statuses: ['PASSED', 'FAILED'],
      },
      {
        uniqueId: 'auto:d52c49b166d26a390ee0b916d8d6838c',
        total: 1,
        itemName: 'testFilterSpecialSymbols',
        endTime: 1509535540122,
        flakyCount: 1,
        statuses: ['SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:4a5435bcab8d0473c44e3f6242042a58',
        total: 1,
        itemName: 'testFilterNegative',
        endTime: 1509535539996,
        flakyCount: 1,
        statuses: ['SKIPPED', 'FAILED'],
      },
      {
        uniqueId: 'auto:4b79b0811d08c9e27aaf5b3ea6e0b0d5',
        total: 1,
        itemName: 'testFilterPositive',
        endTime: 1509535539941,
        flakyCount: 1,
        statuses: ['SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:b73551e3bf7ae57505a2fd80502cac70',
        total: 1,
        itemName: 'testFilterLaunchGreaterThanEqualsNegativeValue',
        endTime: 1509535539566,
        flakyCount: 1,
        statuses: ['FAILED', 'PASSED'],
      },
      {
        uniqueId: 'auto:93fdf25e48841db720725fbb06d3bee4',
        total: 1,
        itemName: 'createLaunchesSpecialSymbolsTag',
        endTime: 1509535540816,
        flakyCount: 1,
        statuses: ['FAILED', 'PASSED'],
      },
      {
        uniqueId: 'auto:d1715ac27a964e29d63882e7bbf82d7b',
        total: 1,
        itemName: 'testFilterLaunchGreaterThanEqualsNotNumber',
        endTime: 1509535539591,
        flakyCount: 1,
        statuses: ['SKIPPED', 'PASSED'],
      },
      {
        uniqueId: 'auto:f9d0ffc1e04c2864067825379d646c96',
        total: 1,
        itemName: 'testCheckFilterSharing',
        endTime: 1509535545276,
        flakyCount: 1,
        statuses: ['PASSED', 'FAILED'],
      },
      {
        uniqueId: 'auto:e7e0a9ab5575a2bb044de325715e74cf',
        total: 1,
        itemName: 'deleteLaunchWithItems',
        endTime: 1509535538833,
        flakyCount: 1,
        statuses: ['PASSED', 'SKIPPED'],
      },
    ],
  },
};
