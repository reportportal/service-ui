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
const attributes = ['build'];

describe('cumulativeTrendChart getOption', () => {
  test('plots one bar series per execution status, in absolute counts, with no chart.js/datalabels involved', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const byId = Object.fromEntries(option.series.map((series) => [series.id, series]));

    expect(byId['statistics$executions$passed']).toMatchObject({
      type: 'bar',
      data: [6, 15],
      itemStyle: { color: COLOR_PASSED },
    });
    expect(byId['statistics$executions$failed']).toMatchObject({ data: [3, 5] });
    expect(byId['statistics$executions$skipped']).toMatchObject({ data: [1, 0] });
    // Defects are always plotted, muted (opacity 0.3) when "Defect Types" focus is off.
    expect(byId['statistics$defects$product_bug$total']).toMatchObject({
      data: [2, 3],
      itemStyle: { opacity: 0.3 },
    });
    // Executions bar renders on the left, defects bar on the right.
    const executionsIndex = option.series.findIndex((series) =>
      series.id.startsWith('statistics$executions$'),
    );
    const defectsIndex = option.series.findIndex((series) =>
      series.id.startsWith('statistics$defects$'),
    );
    expect(executionsIndex).toBeLessThan(defectsIndex);
    option.series.forEach((series) => {
      expect(series.barWidth).toBe('19%');
    });
    expect(option.customData.legendItems).toEqual([
      'statistics$executions$failed',
      'statistics$executions$skipped',
      'statistics$executions$passed',
    ]);
    expect(option.customData.colors).toMatchObject({
      statistics$executions$passed: COLOR_PASSED,
      statistics$executions$failed: COLOR_FAILED,
      statistics$executions$skipped: COLOR_SKIPPED,
    });
    expect(option.xAxis).toMatchObject({ type: 'category', data: ['build-1', 'build-2'] });
    expect(option.xAxis.name).toBe('Build');
  });

  test('converts every series to a percentage of the relevant total when percentage mode is on', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { percentage: true },
    });

    const byId = Object.fromEntries(option.series.map((series) => [series.id, series]));

    expect(byId['statistics$executions$passed'].data).toEqual([60, 75]);
    expect(byId['statistics$executions$failed'].data).toEqual([30, 25]);
    // Defect percentage denominator is the sum of defect fields, not the execution total.
    expect(byId['statistics$defects$product_bug$total'].data).toEqual([66.67, 60]);
    expect(option.yAxis).toMatchObject({ type: 'value', min: 0, max: 100, show: true });
  });

  test('only plots defect bars, at full opacity, when "Defect Types" focus is on', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { defectTypes: true },
    });

    const ids = option.series.map((series) => series.id);

    expect(ids).toEqual([
      'statistics$defects$product_bug$total',
      'statistics$defects$automation_bug$total',
    ]);
    expect(option.series[0].itemStyle.opacity).toBe(1);
    expect(option.customData.legendItems).toEqual([
      'statistics$defects$product_bug$total',
      'statistics$defects$automation_bug$total',
    ]);
  });

  test('adds an invisible total series with a value label instead of the chartjs-plugin-datalabels total', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, percentage: true },
    });

    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');

    expect(totalSeries).toMatchObject({
      type: 'bar',
      barWidth: 0,
      silent: true,
      itemStyle: { color: 'transparent' },
    });
    expect(totalSeries.label.show).toBe(true);
    // The label always shows the absolute count, even in percentage mode.
    expect(totalSeries.label.formatter({ dataIndex: 0 })).toBe(10);
    expect(totalSeries.label.formatter({ dataIndex: 1 })).toBe(20);
  });

  test('omits the total series entirely when "Totals" is off', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: false },
    });

    expect(option.series.some((series) => series.id === 'statistics$executions$total')).toBe(false);
  });

  test('stacks executions and defects into two bars when "Separate" is off', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { separate: false },
    });

    const byId = Object.fromEntries(option.series.map((series) => [series.id, series]));

    expect(byId['statistics$executions$passed'].stack).toBe('executions');
    expect(byId['statistics$executions$failed'].stack).toBe('executions');
    expect(byId['statistics$defects$product_bug$total'].stack).toBe('defects');
  });

  test('drops the stack so every field draws its own independent bar when "Separate" is on', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { separate: true },
    });

    option.series.forEach((series) => {
      expect(series.stack).toBeUndefined();
    });
  });

  test('excludes fields unchecked in the legend from the series list', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
      uncheckedLegendItems: ['statistics$executions$skipped'],
    });

    expect(option.series.some((series) => series.id === 'statistics$executions$skipped')).toBe(
      false,
    );
  });

  test('hides axes and tooltip in preview mode', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      attributes,
      userSettings: {},
    });

    expect(option.xAxis.show).toBe(false);
    expect(option.yAxis.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    expect(option.grid).toMatchObject({ top: 0, left: 0, right: 0, bottom: 0 });
  });

  test('tooltip formatter reports the title, afterTitle content, and per-series values', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const html = option.tooltip.formatter([
      { seriesId: 'statistics$executions$passed', dataIndex: 0 },
      { seriesId: 'statistics$executions$failed', dataIndex: 0 },
    ]);

    expect(html).toContain('Build: build-1');
    expect(html).toContain('Build 1');
    expect(html).toContain('Passed: 6 (60%)');
    expect(html).toContain('Failed: 3 (30%)');
  });
});
