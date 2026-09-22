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
  buildAxisTicks,
  buildColorMap,
  buildLegendItems,
  buildTooltipFormatter,
  ECHARTS_THEME,
} from './configHelpers';

jest.mock('components/widgets/common/tooltip', () => ({
  createTooltipRenderer:
    (
      _TooltipComponent: unknown,
      paramsCalculator: (
        data: Array<{ id: string; value: number | string | null }>,
        color: (id: string) => string | undefined,
        customProps: Record<string, unknown>,
      ) => { label: string; value: string | number | null },
      customProps: Record<string, unknown>,
    ) =>
    (
      data: Array<{ id: string; value: number | string | null }>,
      _title: unknown,
      _value: unknown,
      color: (id: string) => string | undefined,
    ) => {
      const props = paramsCalculator(data, color, customProps);
      return `<div data-testid="tooltip">${props.label}:${props.value}</div>`;
    },
}));

jest.mock('components/widgets/common/utils', () => ({
  getLaunchAxisTicks: (length) => [0, length - 1],
  getTimelineAxisTicks: (length) => [0, Math.floor(length / 2), length - 1],
  getItemColor: (key) => `defect-${key}`,
}));

describe('echarts configHelpers', () => {
  describe('buildColorMap', () => {
    test('maps keys from palette object', () => {
      expect(buildColorMap(['a', 'b'], { a: '#111', b: '#222' })).toEqual({
        a: '#111',
        b: '#222',
      });
    });

    test('supports palette function', () => {
      expect(buildColorMap(['x'], (key) => `color-${key}`)).toEqual({ x: 'color-x' });
    });

    test('falls back to getItemColor when defectTypes provided', () => {
      expect(buildColorMap(['statistics$defects$pb$total'], {}, { PB: [] })).toEqual({
        'statistics$defects$pb$total': 'defect-statistics$defects$pb$total',
      });
    });

    test('omits keys without a resolved color', () => {
      expect(buildColorMap(['known', 'unknown'], { known: '#111' })).toEqual({
        known: '#111',
      });
    });
  });

  describe('buildAxisTicks', () => {
    test('uses launch ticks by default', () => {
      expect(buildAxisTicks(10)).toEqual([0, 9]);
    });

    test('uses timeline ticks when requested', () => {
      expect(buildAxisTicks(10, true)).toEqual([0, 5, 9]);
    });
  });

  describe('buildLegendItems', () => {
    test('returns a shallow copy of keys', () => {
      const keys = ['passed', 'failed'];
      const items = buildLegendItems(keys);
      expect(items).toEqual(keys);
      expect(items).not.toBe(keys);
    });
  });

  describe('buildTooltipFormatter', () => {
    test('adapts ECharts params to C3-style calculator and returns HTML', () => {
      const formatter = buildTooltipFormatter(
        () => null,
        (data, color) => ({
          label: data[0].id,
          value: data[0].value,
          color: color(data[0].id),
        }),
        {},
      );

      const html = formatter({
        dataIndex: 2,
        seriesName: 'failed',
        value: 42,
        color: '#f00',
      });

      expect(html).toBe('<div data-testid="tooltip">failed:42</div>');
    });

    test('supports axis-trigger array params', () => {
      const formatter = buildTooltipFormatter(
        () => null,
        (data) => ({
          label: data.map((item) => item.id).join(','),
          value: data.map((item) => item.value).join(','),
        }),
        {},
      );

      const html = formatter([
        { dataIndex: 0, seriesName: 'a', value: 1 },
        { dataIndex: 0, seriesName: 'b', value: [0, 2] },
      ]);

      expect(html).toBe('<div data-testid="tooltip">a,b:1,2</div>');
    });
  });

  describe('ECHARTS_THEME', () => {
    test('hides built-in legend in favour of custom Legend', () => {
      expect(ECHARTS_THEME.legend).toMatchObject({ show: false });
    });
  });
});
