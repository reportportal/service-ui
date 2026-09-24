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

const intl = (msg) => msg.defaultMessage || msg.id;

describe('mostTimeConsumingTestCasesChart/getOption', () => {
  it('maps statuses to bar colors and keeps C3-like short-range ticks (0.1s)', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage: intl,
    });

    expect(option.series[0]).toEqual(
      expect.objectContaining({
        id: DURATION,
        type: 'bar',
        barWidth: '80%',
        barCategoryGap: '20%',
        data: [
          { value: 810, itemStyle: { color: COLOR_FAILED } },
          { value: 160, itemStyle: { color: COLOR_PASSED } },
          { value: 100, itemStyle: { color: COLOR_SKIPPED } },
        ],
        emphasis: { focus: 'none', itemStyle: { opacity: 0.75 } },
      }),
    );
    expect(option.yAxis).toEqual(
      expect.objectContaining({
        type: 'category',
        show: true,
        inverse: true,
        data: ['0', '1', '2'],
        axisLabel: { show: false },
        splitLine: { show: false },
        axisTick: expect.objectContaining({
          show: true,
          alignWithLabel: true,
          inside: true,
          customValues: ['0', '2'],
        }),
      }),
    );
    expect(option.xAxis).toEqual(
      expect.objectContaining({
        type: 'value',
        show: true,
        name: 'seconds',
        min: 0,
        max: 810,
        interval: 100,
        splitLine: { show: false },
      }),
    );
    expect(option.xAxis.axisLabel.formatter(810)).toBe('0.81');
    expect(option.tooltip.trigger).toBe('item');
    expect(option.tooltip.show).toBe(true);
    expect(option.customData.itemsData).toHaveLength(3);
    expect(option.grid).toEqual(
      expect.objectContaining({ top: 40, left: 35, right: 10, bottom: 50 }),
    );
  });

  it('collapses chrome in preview', () => {
    const { xAxis, yAxis, tooltip, grid } = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage: intl,
    });

    expect([xAxis.show, yAxis.show, tooltip.show]).toEqual([false, false, false]);
    expect(grid).toEqual(expect.objectContaining({ top: 0, left: 0, right: 0, bottom: 0 }));
  });

  it('grows value-axis interval for long durations to cap tick count', () => {
    const { xAxis } = getOption({
      content: sampleContentLongMinutes,
      isPreview: false,
      formatMessage: intl,
    });

    // minutes timeType (60000); base 0.1-unit step = 6000ms; 55 min → 55 * baseStep
    expect(xAxis.name).toBe('minutes');
    expect(xAxis.interval).toBe(330000);
  });
});
