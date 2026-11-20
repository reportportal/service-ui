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

import { COLOR_CHART_INVESTIGATED, COLOR_TO_INVESTIGATE } from 'common/constants/colors';
import { PERIOD_VALUES } from 'common/constants/statusPeriodValues';
import { getOption as getStatusPageOption } from '../../common/statusPageChartConfig';
import { getLaunchModeOption } from './launchModeOption';
import { getTimelineOption } from './timelineOption';
import { calculateTooltipParams } from './utils';
import {
  sampleLaunchContent,
  sampleStatusPageContent,
  sampleTimelineContent,
} from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('investigatedTrendChart getOption', () => {
  test('launch mode: stacked bars, % axis, item tooltip', () => {
    const option = getLaunchModeOption({
      content: sampleLaunchContent,
      isPreview: false,
      formatMessage,
    });

    const toValue = (point) => (point && typeof point === 'object' ? point.value : point);

    expect(option.series.map(({ id, data }) => ({ id, data: data.map(toValue) }))).toEqual([
      { id: 'investigated', data: [60, 75, 50] },
      { id: 'toInvestigate', data: [40, 25, 50] },
    ]);
    expect(option.series[1].data[0]).toMatchObject({ itemStyle: { borderRadius: [3, 3, 0, 0] } });
    expect(option.series[0].data[0]).toBe(60);
    expect(option.series[0]).toMatchObject({
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      barCategoryGap: '40%',
    });
    expect(option.yAxis).toMatchObject({ type: 'value', max: 100, name: '% of investigations' });
    expect(option.yAxis.axisLabel.hideOverlap).toBe(true);
    expect(option.xAxis.data).toEqual(['#1', '#2', '#3']);
    expect(option.tooltip.trigger).toBe('item');
    expect(option.customData.colors).toEqual({
      investigated: COLOR_CHART_INVESTIGATED,
      toInvestigate: COLOR_TO_INVESTIGATE,
    });
  });

  test('launch preview hides axes and tooltip', () => {
    const option = getLaunchModeOption({
      content: sampleLaunchContent,
      isPreview: true,
      formatMessage,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0 });
  });

  test('timeline mode maps dates into stacked bars', () => {
    const option = getTimelineOption({
      content: sampleTimelineContent,
      isPreview: false,
      formatMessage,
    });

    expect(option.series).toHaveLength(2);
    const toValue = (point) => (point && typeof point === 'object' ? point.value : point);

    expect(option.series.map((item) => item.data.map(toValue))).toEqual([
      [55, 70],
      [45, 30],
    ]);
    expect(option.xAxis.data).toEqual(['01.01', '02.01']);
    expect(option.customData.legendItems).toEqual(['investigated', 'toInvestigate']);
  });

  test('timeline tooltip header uses DD.MM.YYYY and 2-decimal percent', () => {
    const option = getTimelineOption({
      content: sampleTimelineContent,
      isPreview: false,
      formatMessage,
    });
    const { itemsData } = option.customData;
    const params = calculateTooltipParams(
      [{ index: 0, id: 'investigated', value: 55 }],
      () => '#000',
      { itemsData, formatMessage, isTimeline: true },
    );

    expect(params.itemName).toBe('01.01.2021');
    expect(params.itemCases).toBe('55.00%');
  });

  test('legend-hidden series: topmost visible segment is rounded', () => {
    const option = getLaunchModeOption({
      content: sampleLaunchContent,
      isPreview: false,
      formatMessage,
      hiddenItems: ['toInvestigate'],
    });

    expect(option.series[0].data[0]).toMatchObject({ value: 60 });
    expect(option.series[0].data[0].itemStyle.borderRadius).toEqual([3, 3, 0, 0]);
  });

  test('status page mode sets week axis title', () => {
    const option = getStatusPageOption({
      content: sampleStatusPageContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: 'bar',
    });

    expect(option.series[0].data).toEqual([65, 80, 40, 90]);
    expect(option.xAxis.name).toBe('t, weeks');
    expect(option.yAxis.max).toBe(100);
    expect(typeof option.tooltip.formatter).toBe('function');
  });
});
