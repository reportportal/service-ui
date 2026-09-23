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

import { COLOR_CHART_DURATION, COLOR_INTERRUPTED } from 'common/constants/colors';
import { DURATION } from 'components/widgets/common/constants';
import { getOption } from './getOption';
import { sampleContent, sampleContentWithInterrupted } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('launchesDurationChart getOption', () => {
  test('builds a horizontal duration bar series with per-item colors', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      id: DURATION,
      type: 'bar',
      barWidth: '60%',
      barCategoryGap: '40%',
      emphasis: {
        focus: 'none',
        itemStyle: { opacity: 0.75 },
      },
    });
    expect(option.series[0].data).toEqual([
      { value: 4607, itemStyle: { color: COLOR_CHART_DURATION } },
      { value: 1526, itemStyle: { color: COLOR_CHART_DURATION } },
      { value: 830, itemStyle: { color: COLOR_CHART_DURATION } },
    ]);
    expect(option.yAxis).toMatchObject({
      type: 'category',
      data: ['#6', '#3', '#2'],
      inverse: true,
      show: true,
    });
    expect(option.xAxis).toMatchObject({
      type: 'value',
      show: true,
      name: 'seconds',
      min: 0,
      // 0.5 display-unit step → 500ms when timeType is seconds
      interval: 500,
    });
    expect(option.xAxis.axisLabel.formatter(4607)).toBe('4.61');
    expect(option.tooltip).toEqual(
      expect.objectContaining({ trigger: 'item', formatter: expect.any(Function), show: true }),
    );
    expect(option.customData.itemsData).toHaveLength(3);
  });

  test('uses average duration and interrupted color for interrupted launches', () => {
    const option = getOption({
      content: sampleContentWithInterrupted,
      isPreview: false,
      formatMessage,
    });

    // Average of non-interrupted: (4607 + 1526) / 2 = 3066.5
    expect(option.series[0].data[2]).toEqual({
      value: 3066.5,
      itemStyle: { color: COLOR_INTERRUPTED },
    });
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
});
