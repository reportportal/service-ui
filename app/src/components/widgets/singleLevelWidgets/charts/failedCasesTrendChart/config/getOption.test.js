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

import { COLOR_FAILED } from 'common/constants/colors';
import {
  expectPreviewModeHidesChart,
  expectSingleSeriesCustomData,
} from 'components/widgets/common/echarts/trendChartOptionAssertions';
import { getOption } from './getOption';
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
      lineStyle: { width: 1 },
    });
    expect(option.series[0].areaStyle).toBeUndefined();
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 2,
      max: 5,
      show: true,
      axisLabel: {
        fontFamily: 'OpenSans',
        fontSize: 10,
        fontWeight: 400,
        customValues: [2, 4, 5],
      },
      axisTick: {
        customValues: [2, 4, 5],
      },
      nameTextStyle: {
        fontFamily: 'OpenSans',
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
    expect(option.color).toEqual([COLOR_FAILED]);
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'axis',
        formatter: expect.any(Function),
        show: true,
      }),
    );
    expectSingleSeriesCustomData(option, {
      seriesId: 'failed',
      color: COLOR_FAILED,
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
    expect(option.yAxis.axisLabel.customValues).toEqual([0, 2, 4, 6, 8, 9]);
    expect(option.yAxis.axisTick.customValues).toEqual([0, 2, 4, 6, 8, 9]);
  });

  test('shows a larger symbol when there is a single data point', () => {
    const option = getOption({
      content: [sampleContent[0]],
      isPreview: false,
      formatMessage,
    });

    expect(option.series[0]).toMatchObject({
      showSymbol: true,
      symbolSize: 10,
    });
  });
});
