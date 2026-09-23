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
import { getOption } from './getOption';
import { sampleContent, sampleContentFields } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;
const defectTypes = {};

describe('launchesComparisonChart getOption', () => {
  test('builds one grouped bar series per status, ordered and colored like the legend', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      defectTypes,
      onChartClick: jest.fn(),
    });

    expect(option.series.map(({ id, data }) => ({ id, data }))).toEqual([
      { id: 'statistics$executions$skipped', data: [0, 10] },
      { id: 'statistics$executions$failed', data: [40, 15] },
      { id: 'statistics$executions$passed', data: [60, 75] },
    ]);
    option.series.forEach((series) => {
      // Grouped (non-stacked) series get their own thin, explicit width and
      // a wider category gap so bars sit thin, side by side, with visible
      // spacing between launches — not stacked-bar defaults. `barGap: '0%'`
      // removes the gap between bars within the same launch, so only
      // `barCategoryGap` separates different launches. `barMinHeight: 1`
      // keeps a zero-value bar a visible, colored 1px sliver flush with the
      // x-axis, instead of fully invisible or a taller, bump-like bar.
      expect(series).toMatchObject({
        type: 'bar',
        barWidth: 22,
        barCategoryGap: '45%',
        barGap: '0%',
        barMinHeight: 1,
      });
      expect(series.stack).toBeUndefined();
    });
    expect(option.customData.legendItems).toEqual([
      'statistics$executions$skipped',
      'statistics$executions$failed',
      'statistics$executions$passed',
    ]);
    expect(option.customData.colors).toMatchObject({
      statistics$executions$passed: COLOR_PASSED,
      statistics$executions$failed: COLOR_FAILED,
      statistics$executions$skipped: COLOR_SKIPPED,
    });
    expect(option.xAxis).toMatchObject({ type: 'category', data: ['#1', '#2'], show: true });
    expect(option.xAxis.axisLine.show).toBe(false);
    expect(option.yAxis).toMatchObject({ type: 'value', min: 0, max: 100, show: true });
    expect(option.tooltip).toEqual(
      expect.objectContaining({ trigger: 'item', formatter: expect.any(Function), show: true }),
    );
  });

  test('keeps a zero-value bar visible as a colored sliver, no d3 post-render pass', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      defectTypes,
      onChartClick: jest.fn(),
    });

    const skippedSeries = option.series.find(
      (series) => series.id === 'statistics$executions$skipped',
    );

    expect(skippedSeries.data[0]).toBe(0);
    expect(skippedSeries.data[1]).toBe(10);
    expect(skippedSeries.barMinHeight).toBe(1);
    expect(skippedSeries.itemStyle.color).toBe(COLOR_SKIPPED);
  });

  test('hides axes and tooltip and collapses padding in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      defectTypes,
      onChartClick: jest.fn(),
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0, right: 0, bottom: 0 });
  });

  test('collapses the top padding when the chart is not clickable', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      defectTypes,
      onChartClick: undefined,
    });

    expect(option.grid.top).toBe(0);
  });
});
