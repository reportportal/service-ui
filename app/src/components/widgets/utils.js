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

import { formatAttribute } from 'common/utils';

export const cumulativeFormatParams = (params = {}) => ({
  attributes: (params.attributes || []).map(formatAttribute).join(','),
});

export const topPatternsFormatParams = (params = {}) =>
  params.patternTemplateName
    ? {
        patternTemplateName: params.patternTemplateName,
      }
    : {};

export const componentHealthCheckFormatParams = (params = {}) => ({
  attributes: (params.attributes || []).join(','),
});

export const getMockData = () => ({
  appliedFilters: [{ id: 28 }],
  id: 1,
  description: 'hello',
  owner: 'superadmin',
  name: 'health check',
  widgetType: 'componentHealthCheckTable',
  share: false,
  widgetPosition: {
    positionX: 200,
    positionY: 200,
  },
  widgetSize: {
    width: 300,
    height: 200,
  },
  content: {
    result: [
      {
        attributeValue: 'Component1Component1Component1Component1Component1',
        passingRate: '90',
        statistics: {
          statistics$defects$automation_bug$ab001: 1,
          statistics$defects$automation_bug$total: 1,
          statistics$defects$product_bug$pb001: 2,
          statistics$defects$product_bug$pb_1h7o5qfcimee9: 1,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 2,
          statistics$defects$to_investigate$total: 2,
          statistics$defects$system_issue$si001: 1,
          statistics$defects$system_issue$total: 1,
          statistics$executions$failed: 545,
          statistics$executions$passed: 522,
          statistics$executions$skipped: 30,
          statistics$executions$total: 10345,
        },
        customColumn: [
          'Mid',
          'High',
          'Mid',
          'High',
          'Mid',
          'High',
          'Mid',
          'High',
          'Mid',
          'High',
          'Mid',
          'High',
        ],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
      {
        attributeValue: 'Component2',
        passingRate: '30',
        statistics: {
          statistics$defects$automation_bug$ab001: 4,
          statistics$defects$automation_bug$total: 4,
          statistics$defects$product_bug$pb001: 3,
          statistics$defects$product_bug$total: 3,
          statistics$defects$to_investigate$ti001: 3,
          statistics$defects$to_investigate$total: 3,
          statistics$executions$failed: 7,
          statistics$executions$passed: 3,
          statistics$executions$skipped: 0,
          statistics$executions$total: 10,
        },
        customColumn: ['Mid', 'High'],
      },
    ],
    total: {
      passingRate: '35.2',
      statistics$defects$automation_bug$total: 1,
      statistics$defects$product_bug$total: 3,
      statistics$defects$to_investigate$total: 2,
      statistics$defects$system_issue$total: 1,
      statistics$executions$failed: 545,
      statistics$executions$passed: 522,
      statistics$executions$skipped: 30,
      statistics$executions$total: 10345,
    },
  },
  contentParameters: {
    itemsCount: 600,
    contentFields: [],
    widgetOptions: {
      attributeKeys: [
        'first_level',
        'second_level',
        'first_level',
        'second_level',
        'first_level',
        'second_level',
        'first_level',
        'second_level',
      ],
      lastRefresh: '12345678910',
      levels: {
        first_level_key: 'ready',
        second_level_key: 'rendering',
      },
      customColumn: 'Ccggggggggggggggggggggggggggggggggggggggggggggggg',
      sort: {
        customColumn: 'ASC',
      },
      latest: false,
      minPassingRate: '80',
    },
  },
});
