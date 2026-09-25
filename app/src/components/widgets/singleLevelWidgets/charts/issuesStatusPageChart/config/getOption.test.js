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

import { PERIOD_VALUES } from 'common/constants/statusPeriodValues';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { getOption } from '../../common/statusPageChartConfig';
import { sampleContent } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;
const areaChartType = MODES_VALUES[CHART_MODES.AREA_VIEW];

describe('issuesStatusPageChart getOption', () => {
  test('renders stacked area series for each issue type', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: areaChartType,
    });

    const seriesNames = option.series.map((s) => s.name);

    expect(seriesNames).toEqual(
      expect.arrayContaining(['product_bug', 'automation_bug', 'system_issue', 'no_defect', 'to_investigate']),
    );
    option.series.forEach((series) => {
      expect(series).toMatchObject({ type: 'line', stack: 'total' });
      expect(series.areaStyle).toBeDefined();
    });
  });

  test('series data matches fixture values', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: areaChartType,
    });

    const productBugSeries = option.series.find((s) => s.name === 'product_bug');

    expect(productBugSeries.data).toEqual([10, 8, 12]);
  });

  test('week axis title for non-month interval', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: areaChartType,
    });

    expect(option.xAxis.name).toBe('t, weeks');
    expect(typeof option.tooltip.formatter).toBe('function');
  });

  test('day axis title for ONE_MONTH interval', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.ONE_MONTH,
      chartType: areaChartType,
    });

    expect(option.xAxis.name).toBe('t, days');
  });

  test('preview hides axes and tooltip', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: true,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: areaChartType,
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
  });

  test('colors mapped per issue type', () => {
    const option = getOption({
      content: sampleContent,
      isPreview: false,
      formatMessage,
      interval: PERIOD_VALUES.THREE_MONTHS,
      chartType: areaChartType,
    });

    expect(option.customData.colors).toMatchObject({
      product_bug: expect.any(String),
      automation_bug: expect.any(String),
      system_issue: expect.any(String),
      no_defect: expect.any(String),
      to_investigate: expect.any(String),
    });
    expect(option.customData.legendItems).toEqual(
      expect.arrayContaining(['product_bug', 'automation_bug', 'system_issue', 'no_defect', 'to_investigate']),
    );
  });
});
