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

import { COLOR_INVESTIGATED, COLOR_TO_INVESTIGATE } from 'common/constants/colors';
import { PERIOD_VALUES } from 'common/constants/statusPeriodValues';
import { getOption as getStatusPageOption } from '../../common/statusPageChartConfig';
import { getLaunchModeOption } from './launchModeOption';
import { getTimelineOption } from './timelineOption';
import {
  sampleLaunchContent,
  sampleStatusPageContent,
  sampleTimelineContent,
} from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('investigatedTrendChart getOption', () => {
  test('builds stacked bar series and percentage y-axis for launch mode', () => {
    const option = getLaunchModeOption({
      content: sampleLaunchContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(2);
    expect(option.series[0]).toMatchObject({
      id: 'investigated',
      type: 'bar',
      stack: 'total',
      data: [60, 75, 50],
      barWidth: '60%',
      barCategoryGap: '40%',
    });
    expect(option.series[1]).toMatchObject({
      id: 'toInvestigate',
      type: 'bar',
      stack: 'total',
      data: [40, 25, 50],
    });
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 0,
      max: 100,
      interval: 10,
      show: true,
    });
    expect(option.yAxis.name).toBe('% of investigations');
    expect(option.xAxis).toMatchObject({
      type: 'category',
      data: ['#1', '#2', '#3'],
      show: true,
    });
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'item',
        formatter: expect.any(Function),
        show: true,
      }),
    );
    expect(option.customData).toMatchObject({
      colors: {
        investigated: COLOR_INVESTIGATED,
        toInvestigate: COLOR_TO_INVESTIGATE,
      },
      legendItems: ['investigated', 'toInvestigate'],
    });
    expect(option.customData.itemsData).toHaveLength(3);
  });

  test('hides axes and tooltip in launch preview mode', () => {
    const option = getLaunchModeOption({
      content: sampleLaunchContent,
      isPreview: true,
      formatMessage,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.yAxis.name).toBeUndefined();
    expect(option.tooltip.show).toBe(false);
    expect(option.grid.top).toBe(0);
    expect(option.grid.left).toBe(0);
  });

  test('builds stacked bar series for timeline mode', () => {
    const option = getTimelineOption({
      content: sampleTimelineContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(2);
    expect(option.series[0]).toMatchObject({
      type: 'bar',
      stack: 'total',
      data: [55, 70],
    });
    expect(option.series[1]).toMatchObject({
      type: 'bar',
      stack: 'total',
      data: [45, 30],
    });
    expect(option.yAxis).toMatchObject({
      type: 'value',
      max: 100,
    });
    expect(option.xAxis.data).toHaveLength(2);
    expect(option.tooltip.trigger).toBe('item');
    expect(option.customData.legendItems).toEqual(['investigated', 'toInvestigate']);
  });

  test('builds stacked bar series for status page mode', () => {
    const option = getStatusPageOption({
      content: sampleStatusPageContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: 'bar',
    });

    expect(option.series).toHaveLength(2);
    expect(option.series[0]).toMatchObject({
      id: 'investigated',
      type: 'bar',
      stack: 'total',
      data: [65, 80, 40, 90],
    });
    expect(option.yAxis).toMatchObject({
      type: 'value',
      max: 100,
    });
    expect(option.xAxis.name).toBe('t, weeks');
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'item',
        formatter: expect.any(Function),
        show: true,
      }),
    );
  });
});
