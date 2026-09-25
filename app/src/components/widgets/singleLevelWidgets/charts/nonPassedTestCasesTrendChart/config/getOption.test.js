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

import { COLOR_FAILEDSKIPPEDTOTAL } from 'common/constants/colors';
import { getOption } from './getOption';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('nonPassedTestCasesTrendChart getOption', () => {
  test('builds line series and percentage y-axis from widget content', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      id: 'notPassed',
      type: 'line',
      data: [33.33, 50, 25],
      showSymbol: true,
      symbolSize: 2,
      lineStyle: { width: 1 },
      cursor: 'pointer',
    });
    expect(option.series[0].areaStyle).toBeUndefined();
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 0,
      max: 100,
      interval: 10,
      show: true,
      axisLabel: {
        fontFamily: 'OpenSans',
        fontSize: 10,
        fontWeight: 400,
      },
      nameTextStyle: {
        fontFamily: 'OpenSans',
        fontSize: 12,
        fontWeight: 400,
      },
    });
    expect(option.yAxis.name).toBe('% of non-passed cases');
    expect(option.xAxis).toMatchObject({
      type: 'category',
      data: ['# 1', '# 2', '# 3'],
      show: true,
    });
    expect(option.color).toEqual([COLOR_FAILEDSKIPPEDTOTAL]);
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'axis',
        formatter: expect.any(Function),
        show: true,
      }),
    );
    expect(option.customData).toMatchObject({
      colors: { notPassed: COLOR_FAILEDSKIPPEDTOTAL },
      legendItems: ['notPassed'],
    });
    expect(option.customData.itemsData).toHaveLength(3);
  });

  test('hides axes, tooltip label and reserves no legend space in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.yAxis.name).toBeUndefined();
    expect(option.tooltip.show).toBe(false);
    expect(option.grid.top).toBe(0);
    expect(option.grid.left).toBe(0);
    expect(option.series[0].cursor).toBe('default');
    expect(option.series[0].silent).toBe(true);
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
