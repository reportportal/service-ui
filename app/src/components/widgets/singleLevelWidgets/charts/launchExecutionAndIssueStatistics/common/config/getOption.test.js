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

import { getOption } from './getOption';
import { sampleContent, sampleContentFields, sampleGetColumns } from './fixtures/sampleContent';

const formatMessage = (msg) => msg?.defaultMessage ?? msg?.id ?? msg;

// Avoids rendering the real `IssueTypeStatTooltip` component through
// ReactDOMServer — its own unrelated defaultProps deprecation warning would
// otherwise fail this suite (jestsetup.js turns console.error into a throw).
// This keeps the assertion on what this migration actually changed: how the
// tooltip resolves the hovered slice's id and percentage.
jest.mock('components/widgets/common/tooltip', () => ({
  createTooltipRenderer:
    (_TooltipComponent, paramsCalculator, customProps) => (data, _title, _value, color) => {
      const props = paramsCalculator(data, color, customProps);
      return `<div>${props.issueStatNameProps.itemName}:${props.itemsCount}</div>`;
    },
}));

describe('donutChart getOption', () => {
  test('builds one pie slice per column, colored and sized by value', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
    });

    expect(option.series).toHaveLength(2);
    expect(option.series[0]).toMatchObject({
      type: 'pie',
      radius: ['40%', '68%'],
      // Shifted down from dead-center so the ring doesn't sit flush against
      // the legend/title above it.
      center: ['50%', '60%'],
    });
    expect(option.series[0].data).toEqual([
      {
        id: 'statistics$executions$passed',
        name: 'statistics$executions$passed',
        value: 60,
        itemStyle: { color: '#56b985' },
      },
      {
        id: 'statistics$executions$failed',
        name: 'statistics$executions$failed',
        value: 30,
        itemStyle: { color: '#f65e5e' },
      },
      {
        id: 'statistics$executions$skipped',
        name: 'statistics$executions$skipped',
        value: 10,
        itemStyle: { color: '#6d6d6d' },
      },
    ]);
    // No series-level id/name — the generic click/tooltip param resolution
    // must fall through to each data point's own name, not the series id.
    expect(option.series[0].id).toBeUndefined();
    expect(option.series[0].name).toBeUndefined();
    // The ring's own hover-grow effect is off whenever the separate label
    // series is also rendered: that series can't react to the ring's hover
    // state, so scaling the ring here would visibly detach the percentage
    // label from its slice while hovered.
    expect(option.series[0].emphasis.scale).toBe(false);
    // The visible ring draws no labels itself...
    expect(option.series[0].label.show).toBe(false);
    expect(option.series[0].labelLine.show).toBe(false);
    // ...they're carried by an invisible, non-interactive pie whose band is
    // biased inward, so the percentages sit a bit closer to the center than
    // the ring's own mid-radius, without changing the ring's thickness.
    const labelSeries = option.series[1];
    expect(labelSeries).toMatchObject({
      type: 'pie',
      radius: ['40%', '64%'],
      center: ['50%', '60%'],
      silent: true,
      itemStyle: { color: 'transparent', borderWidth: 0 },
      emphasis: { disabled: true },
    });
    expect(labelSeries.data.map(({ id, value }) => ({ id, value }))).toEqual(
      option.series[0].data.map(({ id, value }) => ({ id, value })),
    );
    // Percentage labels sit inside each slice, not floating outside with leader
    // lines, are regular weight (not bold), and centered on their anchor.
    expect(labelSeries.label).toMatchObject({
      show: true,
      position: 'inside',
      fontSize: 13,
      fontWeight: 400,
      align: 'center',
      verticalAlign: 'middle',
    });
    // One decimal place (e.g. "100.0%"), not the whole-number rounding of `{d}%`.
    expect(labelSeries.label.formatter({ percent: 100 })).toBe('100.0%');
    expect(labelSeries.label.formatter({ percent: 33.333 })).toBe('33.3%');
    expect(labelSeries.labelLine.show).toBe(false);
    expect(option.customData.legendItems).toEqual([
      'statistics$executions$passed',
      'statistics$executions$failed',
      'statistics$executions$skipped',
    ]);
  });

  test('renders the total and subtitle as a graphic overlay instead of a d3 DOM patch', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
    });

    expect(option.graphic).toHaveLength(2);
    expect(option.graphic[0].style).toMatchObject({ text: '100', fontSize: 25 });
    expect(option.graphic[1].style).toMatchObject({
      text: 'SUM',
      fontSize: 23,
      fontWeight: 700,
      fill: '#666666',
    });
    // Centered as a pair a couple points above the ring's own true center
    // (60%), not flush on it.
    expect(option.graphic[0].top).toBe('54%');
    expect(option.graphic[1].top).toBe('62%');
  });

  test('excludes unchecked legend items from the center total, like the old chart.data.shown() total', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      uncheckedLegendItems: ['statistics$executions$skipped'],
    });

    // Full total is 100 (60 + 30 + 10); with "skipped" unchecked it's 90.
    expect(option.graphic[0].style.text).toBe('90');
  });

  test('omits the pie series and shows a 0 total when every legend item is unchecked', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      uncheckedLegendItems: [
        'statistics$executions$passed',
        'statistics$executions$failed',
        'statistics$executions$skipped',
      ],
    });

    expect(option.series).toEqual([]);
    expect(option.graphic[0].style.text).toBe('0');
    // All three stay selectable in the legend even though none are plotted.
    expect(option.customData.legendItems).toEqual([
      'statistics$executions$passed',
      'statistics$executions$failed',
      'statistics$executions$skipped',
    ]);
  });

  test('drops unchecked items from the pie data instead of leaving them at 0%', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      uncheckedLegendItems: ['statistics$executions$skipped'],
    });

    expect(option.series[0].data.map((item) => item.id)).toEqual([
      'statistics$executions$passed',
      'statistics$executions$failed',
    ]);
  });

  test('drops 0-value items from the pie data so they get no wedge or label, but keeps them in the legend', () => {
    const zeroItemGetColumns = () => ({
      columns: [
        ['statistics$executions$passed', 60],
        ['statistics$executions$failed', 30],
        ['statistics$executions$skipped', 0],
      ],
      colors: {
        statistics$executions$passed: '#56b985',
        statistics$executions$failed: '#f65e5e',
        statistics$executions$skipped: '#6d6d6d',
      },
    });

    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: zeroItemGetColumns },
      chartText: 'SUM',
    });

    expect(option.series[0].data.map((item) => item.id)).toEqual([
      'statistics$executions$passed',
      'statistics$executions$failed',
    ]);
    expect(option.customData.legendItems).toEqual([
      'statistics$executions$passed',
      'statistics$executions$failed',
      'statistics$executions$skipped',
    ]);
  });

  test('shrinks the center label and hides per-slice labels in small-view mode', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: true,
    });

    expect(option.graphic[0].style.fontSize).toBe(15);
    expect(option.series[0].label.show).toBe(false);
    expect(option.series[0].labelLine.show).toBe(false);
    // No separate label series in small-view mode (only the ring itself),
    // so there's nothing for the hover-grow effect to detach from.
    expect(option.series).toHaveLength(1);
    expect(option.series[0].emphasis.scale).toBe(true);
  });

  test('shrinks and lowers the ring itself in small-view mode, not just its labels', () => {
    const normalOption = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: false,
    });
    const smallOption = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: true,
    });

    expect(smallOption.series[0].radius).toEqual(['30%', '50%']);
    expect(smallOption.series[0].center).toEqual(['50%', '70%']);
    expect(smallOption.series[0].radius).not.toEqual(normalOption.series[0].radius);
    expect(smallOption.series[0].center).not.toEqual(normalOption.series[0].center);
  });

  test('hides per-slice labels and tooltip and makes the pie non-interactive in preview mode, but still shows the center total', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
    });

    expect(option.series[0].silent).toBe(true);
    expect(option.series[0].label.show).toBe(false);
    expect(option.tooltip.show).toBe(false);
    // A preview with no numbers in it isn't a meaningful preview.
    expect(option.graphic).toHaveLength(2);
    expect(option.graphic[0].style.text).toBe('100');
    expect(option.graphic[1].style.text).toBe('SUM');
    // A dedicated, smaller preview font — preview is a fixed, tiny
    // thumbnail regardless of how `small` (a container-size check) is
    // computed, so it doesn't just fall back to the general small tier.
    expect(option.graphic[0].style.fontSize).toBe(12);
    expect(option.graphic[1].style.fontSize).toBe(10);
  });

  test('centers the ring in preview mode even when small, since no legend renders there to clear', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: true,
    });

    expect(option.series[0].center).toEqual(['50%', '60%']);
    // Value/subtitle pair centered as a pair further above the ring's own
    // center (60%) than in the full widget, not pushed down by the
    // small-view legend clearance offset.
    expect(option.graphic[0].top).toBe('50%');
    expect(option.graphic[1].top).toBe('62%');
  });

  test('uses a bigger ring in preview than the general small-view size, since preview never needs legend clearance', () => {
    const smallOption = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: true,
    });
    const previewOption = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: true,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
      small: true,
    });

    expect(previewOption.series[0].radius).toEqual(['52%', '86%']);
    expect(previewOption.series[0].radius).not.toEqual(smallOption.series[0].radius);
  });

  test('omits the pie series entirely (not even an empty ring) when every column is zero', () => {
    const zeroGetColumns = () => ({
      columns: [
        ['statistics$defects$product_bug$total', 0],
        ['statistics$defects$automation_bug$total', 0],
      ],
      colors: {
        statistics$defects$product_bug$total: '#f65e5e',
        statistics$defects$automation_bug$total: '#f4a239',
      },
    });

    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: zeroGetColumns },
      chartText: 'ISSUES',
    });

    expect(option.series).toEqual([]);
    expect(option.graphic[0].style.text).toBe('0');
    expect(option.graphic[1].style.text).toBe('ISSUES');
  });

  test('tooltip formatter reports the hovered slice value and percentage of the total', () => {
    const option = getOption({
      content: sampleContent,
      contentFields: sampleContentFields,
      isPreview: false,
      formatMessage,
      configParams: { getColumns: sampleGetColumns },
      chartText: 'SUM',
    });

    const html = option.tooltip.formatter({
      dataIndex: 0,
      name: 'statistics$executions$passed',
      value: 60,
      color: '#56b985',
    });

    // The id comes from the slice's own `name`, not the (unset) series id.
    expect(html).toBe('<div>statistics$executions$passed:60 (60.00%)</div>');
  });
});
