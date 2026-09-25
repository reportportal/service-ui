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

import { STATS_PASSED, STATS_FAILED } from 'common/constants/statistics';
import { MODES_VALUES, CHART_MODES } from 'common/constants/chartModes';
import { COLOR_PASSED, COLOR_NOTPASSED } from 'common/constants/colors';
import { getOption, NOT_PASSED_STATISTICS_KEY } from './getOption';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('passingRateChart getOption', () => {
  describe('bar mode', () => {
    const viewMode = MODES_VALUES[CHART_MODES.BAR_VIEW];

    test('builds two stacked horizontal bar series', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series).toHaveLength(2);
      expect(option.series[0]).toMatchObject({
        type: 'bar',
        stack: 'total',
        id: STATS_PASSED,
        data: [sampleContent.passed],
      });
      expect(option.series[1]).toMatchObject({
        type: 'bar',
        stack: 'total',
        id: NOT_PASSED_STATISTICS_KEY,
        data: [sampleContent.total - sampleContent.passed],
      });
    });

    test('uses correct colors', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series[0].itemStyle.color).toBe(COLOR_PASSED);
      expect(option.series[1].itemStyle.color).toBe(COLOR_NOTPASSED);
    });

    test('uses STATS_FAILED key when excludeSkipped is true', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: true });

      expect(option.series[1].id).toBe(STATS_FAILED);
      const totalWithoutSkipped = sampleContent.total - sampleContent.skipped;
      expect(option.series[1].data[0]).toBe(totalWithoutSkipped - sampleContent.passed);
    });

    test('xAxis is value type, yAxis is category type', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.xAxis).toMatchObject({ type: 'value', show: false });
      expect(option.yAxis).toMatchObject({ type: 'category', show: false });
    });

    test('bar labels are hidden in preview mode', () => {
      const option = getOption({ content: sampleContent, isPreview: true, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series[0].label.show).toBe(false);
      expect(option.series[1].label.show).toBe(false);
    });

    test('tooltip is item-triggered and has formatter', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.tooltip).toMatchObject({
        trigger: 'item',
        show: true,
        formatter: expect.any(Function),
      });
    });

    test('tooltip is hidden in preview mode', () => {
      const option = getOption({ content: sampleContent, isPreview: true, formatMessage, viewMode, excludeSkipped: false });

      expect(option.tooltip.show).toBe(false);
    });

    test('legendItems in customData match series ids', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.customData.legendItems).toEqual([STATS_PASSED, NOT_PASSED_STATISTICS_KEY]);
    });
  });

  describe('pie mode', () => {
    const viewMode = MODES_VALUES[CHART_MODES.PIE_VIEW];

    test('builds a single pie series with two data points', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series).toHaveLength(1);
      expect(option.series[0]).toMatchObject({ type: 'pie' });
      expect(option.series[0].data).toHaveLength(2);
      expect(option.series[0].data[0]).toMatchObject({ name: STATS_PASSED, value: sampleContent.passed });
      expect(option.series[0].data[1]).toMatchObject({
        name: NOT_PASSED_STATISTICS_KEY,
        value: sampleContent.total - sampleContent.passed,
      });
    });

    test('pie has full radius (no inner hole)', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series[0].radius[0]).toBe('0%');
    });

    test('series is silent in preview', () => {
      const option = getOption({ content: sampleContent, isPreview: true, formatMessage, viewMode, excludeSkipped: false });

      expect(option.series[0].silent).toBe(true);
    });
  });

  describe('donut mode', () => {
    const viewMode = MODES_VALUES[CHART_MODES.DONUT_VIEW];

    test('donut has inner radius', () => {
      const option = getOption({ content: sampleContent, isPreview: false, formatMessage, viewMode, excludeSkipped: false });

      const innerPct = parseInt(option.series[0].radius[0], 10);
      const outerPct = parseInt(option.series[0].radius[1], 10);

      expect(innerPct).toBeGreaterThan(0);
      expect(outerPct).toBeGreaterThan(innerPct);
    });
  });
});
