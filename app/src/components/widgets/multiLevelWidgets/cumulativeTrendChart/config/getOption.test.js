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

import { COLOR_BLACK, COLOR_FAILED, COLOR_PASSED, COLOR_SKIPPED } from 'common/constants/colors';
import {
  BAR_WIDTH,
  BAR_WIDTH_SEPARATE,
  BAR_WIDTH_WITH_TOTAL,
  getBarsLeftOffset,
  getOption,
} from './getOption';
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
      expect(String(series.barWidth)).toBe(BAR_WIDTH);
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
    // The "%" belongs on the y-axis ticks, not on the bars themselves.
    expect(option.yAxis).toMatchObject({ type: 'value', min: 0, max: 100, show: true });
    expect(option.yAxis.axisLabel.formatter).toBe('{value}%');
    expect(byId['statistics$executions$passed'].label).toBeUndefined();
  });

  test('steps the count y-axis by 2, and the percentage one by 10 (0-100 over 10 ticks)', () => {
    const counts = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { percentage: false },
    });
    const percentages = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { percentage: true },
    });

    expect(counts.yAxis.interval).toBe(2);
    expect(percentages.yAxis.interval).toBe(10);
  });

  test('caps bar width in absolute pixels, so a few categories can\'t stretch bars far past what looks right', () => {
    const stacked = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { separate: false },
    });
    const separate = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { separate: true },
    });

    stacked.series.forEach((series) => expect(series.barMaxWidth).toBe(90));
    separate.series.forEach((series) => expect(series.barMaxWidth).toBe(36));
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

  test('adds the total as a custom-rendered series, decoupled from the real bars\' shared layout', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, percentage: true },
    });

    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');

    // `custom`, not `bar`: a `bar` series sharing the category axis would
    // force ECharts to recompute the *whole* shared bar-group layout for
    // every series in it (including the real bars) whenever the total's own
    // width/gap changes. `custom` draws exactly what `renderItem` returns
    // and never joins that shared calculation.
    expect(totalSeries.type).toBe('custom');
    // Required for `api.coord`/`api.barLayout` inside `renderItem` to
    // resolve against the chart's real x/y axes.
    expect(totalSeries.coordinateSystem).toBe('cartesian2d');
    expect(totalSeries.itemStyle).toMatchObject({ color: COLOR_BLACK });
    expect(typeof totalSeries.renderItem).toBe('function');
    // Absolute counts, paired with their category index — even in
    // percentage mode, since "100%" alone wouldn't say much.
    expect(totalSeries.data).toEqual([
      [0, 100],
      [1, 100],
    ]);
  });

  test('renderItem draws the line just left of the real bars\' left edge, with the total centered above it', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true },
    });

    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');

    const api = {
      value: (dimIndex) => (dimIndex === 0 ? 0 : 10),
      coord: ([, value]) => [500, 200 - value],
      size: () => [400, 0],
    };

    const result = totalSeries.renderItem({}, api);

    const line = result.children.find((child) => child.type === 'line');
    const text = result.children.find((child) => child.type === 'text');
    // Two stacks, each 14% of 400 = 56px, 10% (5.6px) gap between them:
    // 117.6px total, so the bars start 58.8px left of center; the line sits
    // a further 6px left of that.
    expect(line.shape.x1).toBeCloseTo(500 - 58.8 - 6);
    expect(line.shape.x2).toBeCloseTo(500 - 58.8 - 6);
    expect(text.x).toBeCloseTo(line.shape.x1);
    expect(text.style).toMatchObject({ text: '10', align: 'center', verticalAlign: 'bottom' });
  });

  test('getBarsLeftOffset mirrors ECharts\' bar layout, including the pixel max-width cap', () => {
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 2, barWidthPercent: BAR_WIDTH_WITH_TOTAL, barMaxWidth: 90 }),
    ).toBeCloseTo(-58.8);
    // 14% of 1000 = 140px, capped to 90px per bar.
    expect(
      getBarsLeftOffset({ bandWidth: 1000, groupCount: 2, barWidthPercent: BAR_WIDTH_WITH_TOTAL, barMaxWidth: 90 }),
    ).toBeCloseTo(-94.5);
    // Every visible field is its own group when "Separate" is on.
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 5, barWidthPercent: BAR_WIDTH_SEPARATE, barMaxWidth: 36 }),
    ).toBeCloseTo(-(5 * 20 + 4 * 2) / 2);
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 0, barWidthPercent: BAR_WIDTH_WITH_TOTAL, barMaxWidth: 90 }),
    ).toBe(0);
  });

  test('centers the line on the category when every field is unchecked, so there\'s nothing to line up against', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, defectTypes: true },
      uncheckedLegendItems: [
        'statistics$defects$product_bug$total',
        'statistics$defects$automation_bug$total',
      ],
    });

    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');
    const api = { value: () => 0, coord: () => [100, 0], size: () => [400, 0] };

    const result = totalSeries.renderItem({}, api);

    expect(result.children.find((child) => child.type === 'line').shape.x1).toBe(100 - 6);
  });

  test('makes the regular bars thinner when totals are shown, without giving them a barGap that would shift their group', () => {
    const withoutTotal = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: false },
    });
    const withTotal = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true },
    });
    const withTotalSeparate = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, separate: true },
    });

    withoutTotal.series.forEach((series) => expect(String(series.barWidth)).toBe(BAR_WIDTH));
    withTotal.series
      .filter((series) => series.id !== 'statistics$executions$total')
      .forEach((series) => {
        expect(String(series.barWidth)).toBe(BAR_WIDTH_WITH_TOTAL);
        expect(series.barGap).toBeUndefined();
      });
    withTotalSeparate.series
      .filter((series) => series.id !== 'statistics$executions$total')
      .forEach((series) => expect(String(series.barWidth)).toBe(BAR_WIDTH_SEPARATE));
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
      expect(String(series.barWidth)).toBe(BAR_WIDTH_SEPARATE);
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

  test('only shows the tooltip on a bar, with no axis crosshair, via item trigger', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    // Always `item`, in every mode: with two stacks (executions, defects)
    // sitting next to each other in the same category, an `axis` trigger
    // would report both stacks together instead of just the hovered one —
    // the formatter itself expands the hovered field out to the rest of
    // its own stack (see the next test), so `item` is enough.
    expect(option.tooltip.trigger).toBe('item');
    expect(option.tooltip.axisPointer).toEqual({ show: false });
    // Overrides the shared theme's `padding: 0` so the popover has breathing room.
    expect(option.tooltip.extraCssText).toContain('padding: 6px 6px');
  });

  test('tooltip formatter reports the title, afterTitle content, and the hovered bar value with a square color marker', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$passed',
      dataIndex: 0,
      color: COLOR_PASSED,
    });

    // Title is bold, and the row leads with a square (not ECharts' default round) marker.
    expect(html).toContain('font-weight: 600');
    expect(html).toContain('Build: build-1');
    expect(html).toContain('Build 1');
    expect(html).toContain(`background-color:${COLOR_PASSED}`);
    expect(html).not.toContain('border-radius');
    expect(html).toContain('Passed: 6 (60%)');
  });

  test('expands the hovered field out to the rest of its own stack, not the unrelated stack next to it', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    // Only ECharts gives us info about the hovered item — everything else
    // in its stack has to be looked up from the raw data ourselves.
    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$failed',
      dataIndex: 0,
      color: COLOR_FAILED,
    });

    // Every execution status shows, since they're all in the hovered field's
    // own stack...
    expect(html).toContain('Passed: 6 (60%)');
    expect(html).toContain('Failed: 3 (30%)');
    expect(html).toContain('Skipped: 1 (10%)');
    // ...but nothing from the unrelated defects stack sitting next to it.
    expect(html).not.toContain('Product bug');
    expect(html).not.toContain('Automation bug');
  });

  test('only shows the hovered field on its own when bars are separate, not the rest of the (dropped) stack', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { separate: true },
    });

    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$failed',
      dataIndex: 0,
      color: COLOR_FAILED,
    });

    expect(html).toContain('Failed: 3 (30%)');
    expect(html).not.toContain('Passed');
    expect(html).not.toContain('Skipped');
  });

  test('tooltip formatter shows the total as its own bold row when the total line itself is hovered', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true },
    });

    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$total',
      dataIndex: 0,
      color: COLOR_BLACK,
    });

    // The total is always 100% of itself, and nothing else from the
    // category shows alongside it.
    expect(html).toContain('Total: 10 (100%)');
    expect(html).not.toContain('Passed');
    const totalRowIndex = html.indexOf('Total: 10');
    const totalRowStart = html.lastIndexOf('<div', totalRowIndex);
    expect(html.slice(totalRowStart, totalRowIndex)).toContain('font-weight: 600');
  });

  test('never fades other bars when one is hovered', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    option.series.forEach((series) => {
      expect(series.emphasis.focus).toBe('none');
    });
  });
});
