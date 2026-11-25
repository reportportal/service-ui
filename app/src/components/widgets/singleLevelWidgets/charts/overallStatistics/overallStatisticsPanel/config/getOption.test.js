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
import { getStatusOption, getDefectsOption } from './getOption';

const DEFECT_TYPES = {
  PRODUCT_BUG: [{ locator: 'pb001', longName: 'Product bug', shortName: 'PB', color: '#111111' }],
  AUTOMATION_BUG: [
    { locator: 'ab001', longName: 'Automation bug', shortName: 'AB', color: '#222222' },
  ],
};
const PRODUCT_BUG_KEY = 'statistics$defects$product_bug$pb001';
const AUTOMATION_BUG_KEY = 'statistics$defects$automation_bug$ab001';

describe('overallStatisticsPanel getOption', () => {
  describe('getStatusOption', () => {
    it('plots only non-zero statuses and rounds the value end of the last one', () => {
      const option = getStatusOption({
        content: [
          {
            values: {
              statistics$executions$total: 16,
              statistics$executions$passed: 5,
              statistics$executions$failed: 0,
              statistics$executions$skipped: 2,
            },
          },
        ],
      });

      expect(option.series.map(({ id }) => id)).toEqual([PASSED, SKIPPED]);
      expect(option.xAxis.max).toBe(16);
      expect(option.series[0].data[0].itemStyle.borderRadius).toBe(0);
      expect(option.series[1].data[0].itemStyle.borderRadius).toEqual([0, 2, 2, 0]);
    });

    it('keeps interrupted status between failed and skipped when separated', () => {
      const option = getStatusOption({
        content: [
          {
            values: {
              statistics$executions$total: 10,
              statistics$executions$passed: 4,
              statistics$executions$failed: 3,
              statistics$executions$interrupted: 1,
              statistics$executions$skipped: 2,
            },
          },
        ],
        separateInterrupted: true,
      });

      expect(option.series.map(({ id }) => id)).toEqual([
        PASSED,
        FAILED,
        INTERRUPTED,
        SKIPPED,
      ]);
    });
  });

  describe('getDefectsOption', () => {
    const params = {
      content: [{ values: { [PRODUCT_BUG_KEY]: 7, [AUTOMATION_BUG_KEY]: 3 } }],
      formatMessage: jest.fn(),
      contentFields: [PRODUCT_BUG_KEY, AUTOMATION_BUG_KEY],
      orderedContentFields: [PRODUCT_BUG_KEY, AUTOMATION_BUG_KEY],
      defectTypes: DEFECT_TYPES,
    };

    it('renders one row per defect type in ordered sequence', () => {
      const option = getDefectsOption(params);

      const names = option.graphic.filter(({ id }) => id.endsWith('-name'));

      expect(names.map(({ style }) => style.text)).toEqual(['Product bug', 'Automation bug']);
      expect(option.series[0].data.map(({ id }) => id)).toEqual([
        PRODUCT_BUG_KEY,
        AUTOMATION_BUG_KEY,
      ]);
    });

    it('draws marker, name and value for each row', () => {
      const option = getDefectsOption(params);

      expect(option.graphic).toHaveLength(6);
      expect(option.graphic[2].style.text).toBe('7');
    });

    it('scales bars to the largest value and colors them by defect type', () => {
      const option = getDefectsOption(params);

      expect(option.xAxis.max).toBe(7);
      expect(option.series[0].data[1].itemStyle.color).toBe('#222222');
    });
  });
});
