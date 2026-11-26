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

import { COLOR_CHART_FAILED } from 'common/constants/colors';
import {
  expectPreviewModeHidesChart,
  expectSingleSeriesCustomData,
} from '../../common/trendChartOptionAssertions';
import { getOption } from './getOption';
import { calculateTooltipParams, getMaxTickIntervals, getTicks, getXLabelStep } from './utils';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('failedCasesTrendChart getOption', () => {
  test('builds line + area series and a value y-axis from widget content', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      id: 'failed',
      type: 'line',
      data: [3, 5, 2],
      lineStyle: { width: 2 },
      showSymbol: true,
      symbolSize: 8,
      itemStyle: { opacity: 0 },
      cursor: 'pointer',
    });
    expect(option.series[0].areaStyle).toBeUndefined();
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 2,
      max: 5,
      show: true,
      axisLabel: {
        fontFamily: 'Roboto',
        fontSize: 12,
        fontWeight: 400,
        customValues: [2, 3, 4, 5],
      },
      axisTick: {
        customValues: [2, 3, 4, 5],
      },
      nameTextStyle: {
        fontFamily: 'Roboto',
        fontSize: 12,
        fontWeight: 400,
      },
    });
    expect(option.yAxis.name).toBe('failed cases');
    expect(option.xAxis).toMatchObject({
      type: 'category',
      data: ['# 1', '# 2', '# 3'],
      show: true,
    });
    expect(option.color).toEqual([COLOR_CHART_FAILED]);
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'axis',
        formatter: expect.any(Function),
        show: true,
      }),
    );
    expectSingleSeriesCustomData(option, {
      seriesId: 'failed',
      color: COLOR_CHART_FAILED,
      itemsDataLength: 3,
    });
  });

  test('hides axes, tooltip label and reserves no legend space in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
    });

    expectPreviewModeHidesChart(option);
  });

  test('ends the y-axis exactly at the max value instead of rounding up', () => {
    const content = [
      { id: 'launch-1', name: 'Demo Tests', number: '1', startTime: '0', values: { total: '0' } },
      { id: 'launch-2', name: 'Demo Tests', number: '2', startTime: '0', values: { total: '9' } },
    ];

    const option = getOption({ content, isPreview: false, formatMessage });

    expect(option.yAxis.min).toBe(0);
    expect(option.yAxis.max).toBe(9);
    expect(option.yAxis.axisLabel.customValues).toEqual([0, 1.8, 3.6, 5.4, 7.2, 9]);
    expect(option.yAxis.axisTick.customValues).toEqual([0, 1.8, 3.6, 5.4, 7.2, 9]);
  });

  test('shows a larger symbol when there is a single data point', () => {
    const option = getOption({
      content: [sampleContent[0]],
      isPreview: false,
      formatMessage,
    });

    expect(option.series[0]).toMatchObject({
      showSymbol: true,
      symbolSize: 6,
    });
  });

  test('is not interactive in preview mode: default cursor and no hover growth', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
    });

    expect(option.series[0].cursor).toBe('default');
    expect(option.series[0].silent).toBe(true);
  });

  test('uses DS 6 chart styling: 2px line, no x ticks, width-driven x labels', () => {
    const option = getOption({ content: sampleContent, isPreview: false, formatMessage });

    expect(option.series[0].lineStyle.width).toBe(2);
    expect(option.xAxis.axisTick.show).toBe(false);
    expect(option.xAxis.axisLabel.interval(0)).toBe(true);
    expect(option.yAxis.axisLabel.formatter(22.4)).toBe('22');
    expect(option.tooltip.axisPointer.type).toBe('line');
  });

  test('tooltip shows DD.MM.YYYY, HH:mm date and "Failed: <n>" without "cases"', () => {
    const params = calculateTooltipParams([{ index: 0, id: 'failed', value: 44 }], () => '#f00', {
      itemsData: [{ name: 'Nightly regression', number: '145', startTime: '2026-10-25T02:14:00' }],
      formatMessage: (msg) => msg.defaultMessage || msg.id,
    });

    expect(params.itemName).toBe('Nightly regression #145');
    expect(params.startTimeText).toBe('25.10.2026, 02:14');
    expect(params.itemCases).toBe('44');
  });});

describe('failedCasesTrendChart y ticks', () => {
  test('a taller chart gets more Y gridlines', () => {
    expect(getMaxTickIntervals(496)).toBe(5);
    expect(getMaxTickIntervals(250)).toBe(2);
    expect(getMaxTickIntervals(830)).toBe(9);
    expect(getMaxTickIntervals(undefined)).toBe(5);
    expect(getXLabelStep(12, 668)).toBe(2);
    expect(getXLabelStep(12, 1336)).toBe(1);
    expect(getXLabelStep(12, 330)).toBe(4);
    expect(getTicks(0, 100, 10)).toHaveLength(11);
  });
});
