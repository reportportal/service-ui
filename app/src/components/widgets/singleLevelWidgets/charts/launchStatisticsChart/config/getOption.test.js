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

import { MODES_VALUES, CHART_MODES } from 'common/constants/chartModes';
import { getOption } from './getOption';
import {
  CONTENT_FIELDS,
  DEFECT_TYPES,
  sampleLaunchContent,
  sampleTimelineContent,
} from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

const BASE_PARAMS = {
  isPreview: false,
  formatMessage,
  isTimeline: false,
  isZoomEnabled: false,
  widgetViewMode: MODES_VALUES[CHART_MODES.BAR_VIEW],
  isFullscreen: false,
  defectTypes: DEFECT_TYPES,
  orderedContentFields: CONTENT_FIELDS,
  contentFields: CONTENT_FIELDS,
  isSingleColumn: false,
};

describe('launchStatisticsChart getOption', () => {
  test('bar mode: stacked bars with correct data and axes', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS });

    expect(option.series).toHaveLength(3);
    expect(option.series[0]).toMatchObject({
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      barCategoryGap: '40%',
    });
    expect(option.xAxis.data).toEqual(['#1', '#2', '#3']);
    expect(option.tooltip.trigger).toBe('item');
    expect(typeof option.tooltip.formatter).toBe('function');
    expect(option.customData.legendItems).toHaveLength(3);
  });

  test('area mode: stacked lines with areaStyle, no symbols, interactive line events', () => {
    const option = getOption({
      content: sampleLaunchContent,
      ...BASE_PARAMS,
      widgetViewMode: MODES_VALUES[CHART_MODES.AREA_VIEW],
    });

    expect(option.series[0]).toMatchObject({
      type: 'line',
      stack: 'total',
      areaStyle: { opacity: 0.75 },
      lineStyle: { width: 0 },
      symbol: 'none',
      triggerLineEvent: true,
      cursor: 'pointer',
      emphasis: { disabled: true },
    });
    expect(option.tooltip.trigger).toBe('axis');
    expect(option.tooltip.axisPointer).toEqual({ type: 'none' });
    expect(typeof option.tooltip.formatter).toBe('function');
    expect(option.customData.isAreaMode).toBe(true);
    expect(option.customData.hoveredSeriesRef).toEqual({ current: null });
  });

  test('preview hides axes, tooltip and collapses grid', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS, isPreview: true });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0, bottom: 0 });
  });

  test('fullscreen shows y-axis', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS, isFullscreen: true });

    expect(option.yAxis.show).toBe(true);
  });

  test('zoom enabled adds dataZoom slider', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS, isZoomEnabled: true });

    expect(option.dataZoom).toBeDefined();
    expect(option.dataZoom).toHaveLength(2);
    expect(option.dataZoom[0]).toMatchObject({ type: 'inside' });
    expect(option.dataZoom[1]).toMatchObject({ type: 'slider', height: 30 });
    expect(option.grid.bottom).toBe(80);
  });

  test('zoom disabled — no dataZoom', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS, isZoomEnabled: false });

    expect(option.dataZoom).toBeUndefined();
    expect(option.grid.bottom).toBe(40);
  });

  test('timeline mode: categories include day name and date', () => {
    const option = getOption({
      content: sampleTimelineContent,
      ...BASE_PARAMS,
      isTimeline: true,
    });

    expect(option.xAxis.data[0]).toMatch(/^[A-Z][a-z]{2}, 2021-01-01$/);
    expect(option.customData.itemsData[0]).toMatchObject({ date: '2021-01-01' });
  });

  test('single column area: falls back to bar series (ECharts cannot fill area for one point)', () => {
    const option = getOption({
      content: sampleLaunchContent,
      ...BASE_PARAMS,
      widgetViewMode: MODES_VALUES[CHART_MODES.AREA_VIEW],
      isSingleColumn: true,
    });

    expect(option.series[0].type).toBe('bar');
    expect(option.series[0].stack).toBe('total');
  });

  test('customData contains itemsData, colors, legendItems', () => {
    const option = getOption({ content: sampleLaunchContent, ...BASE_PARAMS });

    expect(option.customData).toMatchObject({
      itemsData: expect.arrayContaining([
        expect.objectContaining({ id: 'launch-1', number: '1' }),
      ]),
      legendItems: expect.any(Array),
      colors: expect.any(Object),
    });
  });
});
