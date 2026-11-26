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

import { COLOR_CHART_NON_PASSED } from 'common/constants/colors';
import {
  expectPreviewModeHidesChart,
  expectSingleSeriesCustomData,
} from '../../common/trendChartOptionAssertions';
import { getOption, getAxesUpdate } from './getOption';
import { calculateTooltipParams } from './utils';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;

describe('nonPassedTestCasesTrendChart getOption', () => {
  test('builds a 2px line series and fixed 0-100 percentage y-axis', () => {
    const option = getOption({ content: sampleContent, isPreview: false, formatMessage });

    expect(option.series).toHaveLength(1);
    expect(option.series[0]).toMatchObject({
      id: 'notPassed',
      type: 'line',
      data: [33.33, 50, 25],
      lineStyle: { width: 2 },
      symbolSize: 8,
      itemStyle: { opacity: 0 },
      cursor: 'pointer',
    });
    expect(option.series[0].areaStyle).toBeUndefined();
    expect(option.series[0].emphasis.scale).toBe(false);
    expect(option.yAxis).toMatchObject({
      type: 'value',
      min: 0,
      max: 100,
      interval: 10,
      show: true,
      axisLabel: { fontFamily: 'Roboto', fontSize: 12, fontWeight: 400 },
      nameTextStyle: { fontFamily: 'Roboto', fontSize: 12, fontWeight: 400 },
    });
    expect(option.yAxis.name).toBe('% of non-passed cases');
    expect(option.xAxis).toMatchObject({
      type: 'category',
      data: ['# 1', '# 2', '# 3'],
      show: true,
    });
    expect(option.xAxis.axisTick.show).toBe(false);
    expect(option.color).toEqual([COLOR_CHART_NON_PASSED]);
    expect(option.tooltip).toEqual(
      expect.objectContaining({
        trigger: 'axis',
        formatter: expect.any(Function),
        show: true,
      }),
    );
    expect(option.tooltip.axisPointer).toMatchObject({
      type: 'line',
      lineStyle: { width: 1 },
    });
    expectSingleSeriesCustomData(option, {
      seriesId: 'notPassed',
      color: COLOR_CHART_NON_PASSED,
      itemsDataLength: 3,
    });
  });

  test('hides axes and tooltip in preview mode', () => {
    const option = getOption({ content: sampleContent, isPreview: true, formatMessage });

    expectPreviewModeHidesChart(option);
    expect(option.series[0].cursor).toBe('default');
    expect(option.series[0].silent).toBe(true);
  });

  test('keeps a visible-size point when there is a single data point', () => {
    const option = getOption({ content: [sampleContent[0]], isPreview: false, formatMessage });

    expect(option.series[0]).toMatchObject({ showSymbol: true, symbolSize: 6 });
  });

  test('x label density follows chart width, also after rebuild and resize', () => {
    const content = Array.from({ length: 12 }, (_, i) => ({ ...sampleContent[0], number: `${i}` }));
    const option = getOption({ content, isPreview: false, formatMessage, size: { width: 330 } });

    expect(option.xAxis.axisLabel.interval(4)).toBe(true);
    expect(option.xAxis.axisLabel.interval(2)).toBe(false);

    const update = getAxesUpdate(content, { width: 1336 });
    expect(update.xAxis.axisLabel.interval(1)).toBe(true);
  });

  test('tooltip shows DD.MM.YYYY, HH:mm and a 2-decimal value', () => {
    const params = calculateTooltipParams([{ index: 0, id: 'notPassed', value: 21.9 }], () => '#f00', {
      itemsData: [{ name: 'Nightly regression', number: '152', startTime: '2026-11-03T02:14:00' }],
      formatMessage,
    });

    expect(params.itemName).toBe('Nightly regression #152');
    expect(params.startTimeText).toBe('03.11.2026, 02:14');
    expect(params.itemCases).toBe('21.90');
    expect(params.issueStatNameProps.itemName).toBe('% (Failed+Skipped)/Total');
  });
});