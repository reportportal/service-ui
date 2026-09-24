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

import { COLOR_FAILED, COLOR_PASSED, COLOR_SKIPPED } from 'common/constants/colors';
import { DURATION } from 'components/widgets/common/constants';
import { getOption } from './getOption';
import { sampleContent, sampleContentLongMinutes } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('mostTimeConsumingTestCasesChart getOption', () => {
  test('builds a horizontal duration bar series with status colors', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      id: DURATION,
      type: 'bar',
      barWidth: '80%',
      barCategoryGap: '20%',
      emphasis: {
        focus: 'none',
        itemStyle: { opacity: 0.75 },
      },
    });
    expect(option.series[0].data).toEqual([
      { value: 4607, itemStyle: { color: COLOR_FAILED } },
      { value: 1526, itemStyle: { color: COLOR_PASSED } },
      { value: 830, itemStyle: { color: COLOR_SKIPPED } },
    ]);
    expect(option.yAxis).toMatchObject({
      type: 'category',
      show: true,
      inverse: true,
      data: ['0', '1', '2'],
      axisLabel: { show: false },
      splitLine: { show: false },
      axisTick: {
        show: true,
        alignWithLabel: true,
        inside: true,
        customValues: ['0', '2'],
      },
    });
    expect(option.xAxis).toMatchObject({
      type: 'value',
      show: true,
      name: 'seconds',
      min: 0,
      max: 4607,
      // 0.1 display-unit step → 100ms when timeType is seconds
      interval: 100,
      splitLine: { show: false },
    });
    expect(option.xAxis.axisLabel.formatter(4607)).toBe('4.61');
    expect(option.tooltip).toEqual(
      expect.objectContaining({ trigger: 'item', formatter: expect.any(Function), show: true }),
    );
    expect(option.customData.itemsData).toHaveLength(3);
    expect(option.grid).toMatchObject({ top: 40, left: 35, right: 10, bottom: 50 });
  });

  test('hides axes and tooltip and collapses padding in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0, right: 0, bottom: 0 });
  });

  test('keeps 0.1 display-unit value-axis step for longer durations', () => {
    const option = getOption({
      content: sampleContentLongMinutes,
      isPreview: false,
      formatMessage,
    });

    // minutes timeType (value 60000); 0.1 unit → 6000ms
    expect(option.xAxis.name).toBe('minutes');
    expect(option.xAxis.interval).toBe(6000);
  });
});
