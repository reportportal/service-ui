/*
 * Copyright 2026 EPAM Systems
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

import { FAILED, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/testStatuses';
import { COLOR_CHART_FAILED, COLOR_CHART_PASSED } from 'common/constants/colors';
import { getStatusItems, getDefectItems } from './utils';

const DEFECT_TYPES = {
  PRODUCT_BUG: [{ locator: 'pb001', longName: 'Product bug', shortName: 'PB', color: '#111111' }],
};

describe('overallStatisticsPanel config utils', () => {
  it('returns passed, failed, skipped statuses without interrupted by default', () => {
    const values = {
      statistics$executions$passed: 5,
      statistics$executions$failed: 2,
      statistics$executions$skipped: 1,
    };
    const items = getStatusItems(values, false);

    expect(items.map(({ id }) => id)).toEqual([PASSED, FAILED, SKIPPED]);
    expect(items[0]).toEqual({ id: PASSED, value: 5, color: COLOR_CHART_PASSED });
    expect(items[1].color).toBe(COLOR_CHART_FAILED);
  });

  it('inserts interrupted between failed and skipped when separated', () => {
    const items = getStatusItems({ statistics$executions$interrupted: 3 }, true);

    expect(items.map(({ id }) => id)).toEqual([PASSED, FAILED, INTERRUPTED, SKIPPED]);
    expect(items[2].value).toBe(3);
  });

  it('keeps only defect fields from contentFields in ordered sequence', () => {
    const items = getDefectItems({
      values: { 'statistics$defects$product_bug$pb001': 7, 'statistics$executions$passed': 4 },
      orderedContentFields: [
        'statistics$executions$passed',
        'statistics$defects$product_bug$pb001',
      ],
      contentFields: ['statistics$executions$passed', 'statistics$defects$product_bug$pb001'],
      defectTypes: DEFECT_TYPES,
      formatMessage: jest.fn(),
    });

    expect(items).toEqual([
      {
        key: 'statistics$defects$product_bug$pb001',
        name: 'Product bug',
        value: 7,
        color: '#111111',
      },
    ]);
  });
});
