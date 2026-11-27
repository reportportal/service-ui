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

import {
  COLOR_CHART_AXIS_LINE,
  COLOR_CHART_FAILED,
  COLOR_CHART_PASSED,
} from 'common/constants/colors';
import { getOption, getAxesUpdate } from './getOption';
import { sampleLaunchContent, sampleTimelineContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('testCasesGrowthTrendChart getOption', () => {
  test('builds stacked offset + bar series with growth colors', () => {
    const option = getOption({
      content: sampleLaunchContent,
      isPreview: false,
      formatMessage,
      isTimeline: false,
    });

    expect(option.series).toHaveLength(3);
    expect(option.series[0]).toMatchObject({
      id: 'offset',
      type: 'bar',
      stack: 'total',
      data: [15, 17, 17],
      barWidth: '60%',
      barCategoryGap: '40%',
    });
    expect(option.series[1]).toMatchObject({
      id: 'bar',
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      barCategoryGap: '40%',
      emphasis: {
        focus: 'none',
        itemStyle: { opacity: 0.75 },
      },
    });
    expect(option.series[1].data).toEqual([
      {
        value: 5,
        itemStyle: { color: COLOR_CHART_PASSED, borderRadius: [2, 2, 0, 0] },
      },
      {
        value: 3,
        itemStyle: { color: COLOR_CHART_FAILED, borderRadius: [0, 0, 2, 2] },
      },
      {
        value: 0,
        itemStyle: {
          color: 'rgba(0,0,0,0)',
        },
      },
    ]);
    expect(option.series[2]).toMatchObject({
      id: 'zeroDelta',
      type: 'custom',
      data: [[2, 17]],
      clip: false,
    });
    expect(option.xAxis).toMatchObject({
      type: 'category',
      data: ['#1', '#2', '#3'],
      show: true,
      axisLine: { show: true, lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1 } },
      axisTick: { show: false },
    });
    expect(option.yAxis).toMatchObject({
      type: 'value',
      name: 'cases',
      min: 0,
      interval: 2,
      show: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: COLOR_CHART_AXIS_LINE, width: 1, type: 'solid' },
      },
    });
    expect(option.tooltip).toEqual(
      expect.objectContaining({ trigger: 'axis', formatter: expect.any(Function), show: true }),
    );
    expect(option.customData.positiveTrend).toEqual([true, false, true]);
  });

  test('hides axes and tooltip and collapses padding in preview mode', () => {
    const option = getOption({
      content: sampleLaunchContent,
      isPreview: true,
      formatMessage,
      isTimeline: false,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.series[1].label.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0, right: 0, bottom: 0 });
  });

  test('timeline mode maps dates and negative deltas', () => {
    const option = getOption({
      content: sampleTimelineContent,
      isPreview: false,
      formatMessage,
      isTimeline: true,
    });

    expect(option.series[0].data).toEqual([40, 46]);
    expect(option.series[1].data.map((item) => item.value)).toEqual([10, 4]);
    expect(option.series[1].data[0].itemStyle.color).toBe(COLOR_CHART_PASSED);
    expect(option.series[1].data[1].itemStyle.color).toBe(COLOR_CHART_FAILED);
    expect(option.xAxis.data).toHaveLength(2);
    expect(option.xAxis.data[0]).toBe('01.01');
    expect(option.customData.itemsData).toEqual([{ date: '2021-01-01' }, { date: '2021-01-02' }]);
    expect(option.series.some((series) => series.id === 'zeroDelta')).toBe(false);
  });

  test('bar labels show signed delta on the label step', () => {
    const option = getOption({
      content: sampleLaunchContent,
      isPreview: false,
      formatMessage,
      isTimeline: false,
    });

    const { formatter } = option.series[1].label;
    expect(formatter({ dataIndex: 0, value: 5 })).toBe('5');
    expect(formatter({ dataIndex: 1, value: 3 })).toBe('-3');
    expect(formatter({ dataIndex: 2, value: 0 })).toBe('0');
  });

  test('zero-delta draws a 1px custom line on the stack-top y (not barMinHeight)', () => {
    const option = getOption({
      content: [
        {
          id: 'launch-z',
          name: 'Demo',
          number: '1',
          startTime: '1609459200000',
          values: {
            delta: '0',
            statistics$executions$total: '30',
          },
        },
      ],
      isPreview: false,
      formatMessage,
      isTimeline: false,
    });

    const zeroSeries = option.series.find((series) => series.id === 'zeroDelta');
    expect(zeroSeries).toMatchObject({
      type: 'custom',
      data: [[0, 30]],
      clip: false,
    });
    expect(typeof zeroSeries.renderItem).toBe('function');
    expect(option.series[1].barMinHeight).toBeUndefined();
  });

  describe('label density by chart size', () => {
    const buildLaunches = (count) =>
      Array.from({ length: count }, (_, index) => ({
        id: `launch-${index}`,
        name: 'Regression',
        number: String(index + 1),
        startTime: String(1609459200000 + index * 86400000),
        values: { delta: '5', statistics$executions$total: String(5 * (index + 1)) },
      }));
    const buildDays = (count) =>
      Object.fromEntries(
        buildLaunches(count).map(({ values }, index) => [
          `2021-01-${String(index + 1).padStart(2, '0')}`,
          { values },
        ]),
      );
    const countLabelled = (interval, count) =>
      Array.from({ length: count }, (_, index) => index).filter(interval).length;

    test('reference size labels every launch and every second day', () => {
      const size = { width: 668, height: 496 };
      const launch = getOption({ content: buildLaunches(14), formatMessage, size });
      const timeline = getOption({
        content: buildDays(14),
        formatMessage,
        isTimeline: true,
        size,
      });

      expect(countLabelled(launch.xAxis.axisLabel.interval, 14)).toBe(14);
      expect(countLabelled(timeline.xAxis.axisLabel.interval, 14)).toBe(7);
    });

    test('a taller and wider chart gets more labels on resize', () => {
      const content = buildLaunches(40);
      const small = getAxesUpdate(content, { width: 400, height: 250 });
      const large = getAxesUpdate(content, { width: 1200, height: 900 });

      expect(large.yAxis.interval).toBeLessThan(small.yAxis.interval);
      expect(countLabelled(large.xAxis.axisLabel.interval, 40)).toBeGreaterThan(
        countLabelled(small.xAxis.axisLabel.interval, 40),
      );
    });

    test('axes update matches the initial option for the same size', () => {
      const content = buildLaunches(20);
      const size = { width: 668, height: 496 };
      const option = getOption({ content, formatMessage, size });
      const update = getAxesUpdate(content, size);

      expect(update.yAxis).toEqual({ max: option.yAxis.max, interval: option.yAxis.interval });
    });
  });
});
