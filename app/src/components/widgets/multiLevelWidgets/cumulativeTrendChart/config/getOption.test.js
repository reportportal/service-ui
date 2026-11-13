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

import {
  COLOR_CHART_FAILED,
  COLOR_CHART_PASSED,
  COLOR_CHART_SKIPPED,
  COLOR_PRODUCT_BUG,
  COLOR_WHITE_TWO,
} from 'common/constants/colors';
import {
  BAR_TOP_RADIUS,
  BAR_WIDTH,
  BAR_WIDTH_SEPARATE,
  TOTAL_LINE_COLOR,
  getBarsLeftOffset,
  getOption,
  getStackSeriesIds,
} from './getOption';
import { sampleContent, sampleContentFields } from './fixtures/sampleContent';

const formatMessage = (msg) => msg.defaultMessage || msg.id;
const attributes = ['build'];
// bar points are plain numbers, or { value, itemStyle } for the rounded top segment of a stack
const values = (data) => data.map((point) => (point && typeof point === 'object' ? point.value : point));
const tooltipText = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

describe('cumulativeTrendChart getOption', () => {
  test('plots one bar series per execution status, in absolute counts', () => {
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
      itemStyle: { color: COLOR_CHART_PASSED },
    });
    expect(values(byId['statistics$executions$passed'].data)).toEqual([6, 15]);
    expect(byId['statistics$executions$failed'].data).toEqual([3, 5]);
    expect(byId['statistics$executions$skipped'].data).toEqual([1, null]);
    // Defects are always plotted, muted (opacity 0.3) when "Defect Types" focus is off.
    expect(byId['statistics$defects$product_bug$total']).toMatchObject({
      data: [2, 3],
      itemStyle: { opacity: 0.3, color: COLOR_PRODUCT_BUG },
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
      statistics$executions$passed: COLOR_CHART_PASSED,
      statistics$executions$failed: COLOR_CHART_FAILED,
      statistics$executions$skipped: COLOR_CHART_SKIPPED,
    });
    expect(option.xAxis).toMatchObject({ type: 'category', data: ['build-1', 'build-2'] });
    expect(option.xAxis.name).toBeUndefined();
  });

  test('rounds only the top corners of the topmost non-zero segment of each stack', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const byId = Object.fromEntries(option.series.map((series) => [series.id, series]));
    const rounded = { itemStyle: { borderRadius: BAR_TOP_RADIUS } };

    // executions stack: failed, skipped, passed (top)
    expect(byId['statistics$executions$passed'].data[0]).toMatchObject({ value: 6, ...rounded });
    expect(byId['statistics$executions$skipped'].data[0]).toBe(1);
    // defects stack: product bug, automation bug (top)
    expect(byId['statistics$defects$automation_bug$total'].data[1]).toMatchObject({
      value: 2,
      ...rounded,
    });
    expect(byId['statistics$defects$product_bug$total'].data[1]).toBe(3);
  });

  test('rounds the next segment when the topmost one is unchecked in the legend', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
      uncheckedLegendItems: ['statistics$executions$passed'],
    });

    const skipped = option.series.find((series) => series.id === 'statistics$executions$skipped');
    const failed = option.series.find((series) => series.id === 'statistics$executions$failed');

    expect(skipped.data[0]).toMatchObject({ value: 1, itemStyle: { borderRadius: BAR_TOP_RADIUS } });
    // build-2 has no skipped tests, so failed is the top of that stack
    expect(failed.data[1]).toMatchObject({ value: 5, itemStyle: { borderRadius: BAR_TOP_RADIUS } });
  });

  test('separates touching segments with a 1px border in the card background color', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    option.series.forEach((series) => {
      expect(series.itemStyle).toMatchObject({ borderColor: COLOR_WHITE_TWO, borderWidth: 1 });
    });
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

    expect(values(byId['statistics$executions$passed'].data)).toEqual([60, 75]);
    expect(values(byId['statistics$executions$failed'].data)).toEqual([30, 25]);
    // Defect percentage denominator is the sum of defect fields, not the execution total.
    expect(values(byId['statistics$defects$product_bug$total'].data)).toEqual([66.67, 60]);
    // The "%" belongs on the y-axis ticks, not on the bars themselves.
    expect(option.yAxis).toMatchObject({ type: 'value', min: 0, max: 100, show: true });
    expect(option.yAxis.axisLabel.formatter).toBe('{value}%');
    expect(option.yAxis.name).toBe('% of test cases');
    expect(byId['statistics$executions$passed'].label).toBeUndefined();
  });

  test('lets ECharts pick whole-number steps for counts, and steps the percentage axis by 10', () => {
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

    expect(counts.yAxis.interval).toBeUndefined();
    expect(counts.yAxis.minInterval).toBe(1);
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
    expect(totalSeries.itemStyle).toMatchObject({ color: TOTAL_LINE_COLOR });
    expect(typeof totalSeries.renderItem).toBe('function');
    expect(totalSeries.data).toEqual([
      [0, 100],
      [1, 100],
    ]);
  });

  const renderTotal = (userSettings, point = [0, 10]) => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, ...userSettings },
    });
    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');
    const api = {
      value: (dimIndex) => point[dimIndex],
      coord: ([, value]) => [500, 200 - value],
      size: () => [400, 0],
    };
    const result = totalSeries.renderItem({}, api);
    const find = (type) => result?.children.find((child) => child.type === type);
    return { result, line: find('line'), label: find('text'), hitArea: find('rect') };
  };

  test('renderItem draws a vertical 2px Text/Primary line from 0 to the total, 6px left of the stacks', () => {
    const { line } = renderTotal({});

    expect(line.style).toMatchObject({ stroke: TOTAL_LINE_COLOR, lineWidth: 2 });
    expect(line.shape.x2).toBe(line.shape.x1);
    expect(line.shape.y1).toBe(200);
    expect(line.shape.y2).toBe(190);

    // Two stacks, each 18% of 400 = 72px, 10% (7.2px) gap between them:
    // 151.2px in total, so the bars' layout edge is 75.6px left of center. Their 1px
    // white separator border is centred on that edge, so the visible bar starts 0.5px in.
    const visibleBarLeft = 500 - 75.6 + 0.5;
    const lineRightEdge = line.shape.x1 + line.style.lineWidth / 2;
    expect(visibleBarLeft - lineRightEdge).toBeCloseTo(6);
  });

  test('shows the total count 4px above the line, centered on it, as Chart/Value label', () => {
    const { line, label, hitArea } = renderTotal({});

    expect(label.x).toBe(line.shape.x1);
    expect(line.style.lineCap).toBeUndefined();
    expect(line.shape.y2 - label.y).toBe(4);
    expect(label.style).toEqual({
      text: '10',
      fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
      fontWeight: 400,
      fontSize: 12,
      lineHeight: 16,
      fill: '#3f3f3f',
      align: 'center',
      verticalAlign: 'bottom',
    });
    expect(hitArea.shape).toMatchObject({ y: 190, height: 10, width: 10 });
    expect(hitArea.shape.x + hitArea.shape.width / 2).toBe(line.shape.x1);
  });

  test('sits left of the whole group of columns when "Separate" is on', () => {
    const { line } = renderTotal({ separate: true });

    // 5 bars (3 statuses + 2 defects) of 5% of 400 = 20px with 2px gaps: 108px, centered;
    // 6px from the visible left edge of the first column to the right edge of the line
    const visibleBarLeft = 500 - 54 + 0.5;
    expect(visibleBarLeft - (line.shape.x1 + 1)).toBeCloseTo(6);
  });

  test('reaches 100% in percentage mode, with no count (it would read as a percentage)', () => {
    const { line, label, hitArea } = renderTotal({ percentage: true }, [1, 100]);

    expect(line.shape.y2).toBe(200 - 100);
    expect(label).toBeUndefined();
    expect(hitArea).toBeDefined();
  });

  test('draws no line for an empty category', () => {
    expect(renderTotal({}, [0, 0]).result).toBeNull();
  });

  test('draws only the line in preview mode, no count', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      attributes,
      userSettings: { showTotal: true },
    });
    const totalSeries = option.series.find((series) => series.id === 'statistics$executions$total');
    const api = { value: (dim) => (dim === 0 ? 0 : 10), coord: ([, v]) => [500, 200 - v], size: () => [400, 0] };

    expect(totalSeries.renderItem({}, api).children.map((child) => child.type)).toEqual(['line']);
  });

  test('getBarsLeftOffset mirrors ECharts\' bar layout, including the pixel max-width cap', () => {
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 2, barWidthPercent: BAR_WIDTH, barMaxWidth: 90 }),
    ).toBeCloseTo(-75.6);
    // 18% of 1000 = 180px, capped to 90px per bar.
    expect(
      getBarsLeftOffset({ bandWidth: 1000, groupCount: 2, barWidthPercent: BAR_WIDTH, barMaxWidth: 90 }),
    ).toBeCloseTo(-94.5);
    // Every visible field is its own group when "Separate" is on.
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 5, barWidthPercent: BAR_WIDTH_SEPARATE, barMaxWidth: 36 }),
    ).toBeCloseTo(-(5 * 20 + 4 * 2) / 2);
    expect(
      getBarsLeftOffset({ bandWidth: 400, groupCount: 0, barWidthPercent: BAR_WIDTH, barMaxWidth: 90 }),
    ).toBe(0);
  });

  test('draws no line when every field is unchecked, so there is no stack to mark', () => {
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
    const api = { value: (dim) => (dim === 0 ? 0 : 10), coord: () => [100, 0], size: () => [400, 0] };

    expect(totalSeries.renderItem({}, api)).toBeNull();
  });

  test('keeps the regular bar width when totals are shown', () => {
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
        expect(String(series.barWidth)).toBe(BAR_WIDTH);
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
    expect(option.tooltip).toMatchObject({ padding: [8, 12], borderWidth: 0 });
    expect(option.tooltip.textStyle).toMatchObject({ fontSize: 12, color: COLOR_WHITE_TWO });
    expect(option.tooltip.extraCssText).toContain('border-radius: 8px');
    expect(option.tooltip.extraCssText).toContain('--rp-ui-base-dark-e-400');
  });

  test('tooltip formatter reports the title, afterTitle content, and the stack values with round markers', () => {
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
      color: COLOR_CHART_PASSED,
    });
    const text = tooltipText(html);

    expect(text).toContain('build: build-1');
    expect(text).toContain('Build 1');
    expect(html).toContain(`background-color:${COLOR_CHART_PASSED}`);
    expect(html).toContain('border-radius:50%');
    expect(text).toContain('Passed: 6 (60%)');
    expect(html).toContain('<span style="font-weight:700;">6 (60%)</span>');
  });

  test('lists the stack top-down, in the order the segments are drawn', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const text = tooltipText(
      option.tooltip.formatter({ seriesId: 'statistics$executions$failed', dataIndex: 0 }),
    );

    expect(text.indexOf('Passed')).toBeLessThan(text.indexOf('Skipped'));
    expect(text.indexOf('Skipped')).toBeLessThan(text.indexOf('Failed'));
  });

  test('shows only the percentage in percentage mode', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { percentage: true },
    });

    const text = tooltipText(
      option.tooltip.formatter({ seriesId: 'statistics$executions$passed', dataIndex: 0 }),
    );

    expect(text).toContain('Passed: 60%');
    expect(text).not.toContain('Passed: 6 ');
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
    const html = tooltipText(
      option.tooltip.formatter({
        seriesId: 'statistics$executions$failed',
        dataIndex: 0,
        color: COLOR_CHART_FAILED,
      }),
    );

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

    const html = tooltipText(
      option.tooltip.formatter({
        seriesId: 'statistics$executions$failed',
        dataIndex: 0,
        color: COLOR_CHART_FAILED,
      }),
    );

    expect(html).toContain('Failed: 3 (30%)');
    expect(html).not.toContain('Passed');
    expect(html).not.toContain('Skipped');
  });

  test('leaves out the segments switched off in the legend', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
      uncheckedLegendItems: ['statistics$executions$failed'],
    });

    const text = tooltipText(
      option.tooltip.formatter({ seriesId: 'statistics$executions$passed', dataIndex: 0 }),
    );

    expect(text).toContain('Passed: 6 (60%)');
    expect(text).toContain('Skipped: 1 (10%)');
    expect(text).not.toContain('Failed');
  });

  test('escapes attribute keys and values, and strips unsafe markup from the tooltip content', () => {
    const [first] = sampleContent;
    const option = getOption({
      content: [
        {
          ...first,
          attributeValue: '<img src=x onerror=alert(1)>',
          content: { ...first.content, tooltipContent: 'Build <script>alert(2)</script><b>1</b>' },
        },
      ],
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes: ['<b>build</b>'],
      userSettings: {},
    });

    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$passed',
      dataIndex: 0,
    });

    expect(html).toContain('&lt;b&gt;build&lt;/b&gt;: &lt;img src=x onerror=alert(1)&gt;');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('<b>1</b>');
  });

  test('tooltip formatter shows the total count on its own when the total line itself is hovered', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: { showTotal: true, percentage: true },
    });

    const html = option.tooltip.formatter({
      seriesId: 'statistics$executions$total',
      dataIndex: 0,
      color: TOTAL_LINE_COLOR,
    });

    // The total is always 100% of itself and keeps its absolute count even in
    // percentage mode; nothing else from the category shows alongside it.
    expect(tooltipText(html)).toContain('Total: 10 (100%)');
    expect(html).not.toContain('Passed');
    expect(html).toContain(`background-color:${COLOR_WHITE_TWO}`);
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

  test('lightens a hovered segment to 75% of its own opacity, without scaling it', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });

    const byId = Object.fromEntries(option.series.map((series) => [series.id, series]));

    expect(byId['statistics$executions$passed'].emphasis).toMatchObject({
      scale: false,
      itemStyle: { opacity: 0.75 },
    });
    expect(byId['statistics$defects$product_bug$total'].emphasis.itemStyle.opacity).toBeCloseTo(
      0.225,
    );
  });
});

describe('cumulativeTrendChart getStackSeriesIds', () => {
  const defectFields = [
    'statistics$defects$product_bug$total',
    'statistics$defects$automation_bug$total',
  ];

  test('returns every execution series for a hovered execution segment', () => {
    expect(getStackSeriesIds('statistics$executions$passed', defectFields, false)).toEqual([
      'statistics$executions$failed',
      'statistics$executions$skipped',
      'statistics$executions$passed',
    ]);
  });

  test('returns every defect series for a hovered defect segment', () => {
    expect(getStackSeriesIds('statistics$defects$automation_bug$total', defectFields, false)).toEqual(
      defectFields,
    );
  });

  test('returns only the hovered series with "Separate"', () => {
    expect(getStackSeriesIds('statistics$executions$failed', defectFields, true)).toEqual([
      'statistics$executions$failed',
    ]);
  });

  test('matches the stacks of the bar series', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      attributes,
      userSettings: {},
    });
    const stackOf = (id) => option.series.find((item) => item.id === id).stack;

    getStackSeriesIds('statistics$executions$passed', defectFields, false).forEach((id) =>
      expect(stackOf(id)).toBe(stackOf('statistics$executions$passed')),
    );
    expect(stackOf('statistics$defects$product_bug$total')).not.toBe(
      stackOf('statistics$executions$passed'),
    );
  });
});
