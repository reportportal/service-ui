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

import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import {
  getItemColor,
  getLaunchAxisTicks,
  getTimelineAxisTicks,
} from 'components/widgets/common/utils';
import { COLOR_CHARCOAL_GREY, COLOR_WHITE_TWO } from 'common/constants/colors';
import type {
  C3ColorFn,
  C3TooltipDataItem,
  ColorPalette,
  EChartsOption,
  TooltipComponentType,
  TooltipParamsCalculator,
} from './types';

type EChartsTooltipParam = {
  dataIndex?: number;
  seriesId?: string;
  seriesName?: string;
  name?: string;
  value?: number | string | (number | string)[] | null;
  color?: string;
};

const getSeriesKey = (param: EChartsTooltipParam): string =>
  param.seriesId || param.seriesName || param.name || '';

const getParamValue = (param: EChartsTooltipParam): number | string | null => {
  if (Array.isArray(param.value)) {
    return param.value[param.value.length - 1] ?? null;
  }
  return param.value ?? null;
};

const toC3TooltipData = (
  params: EChartsTooltipParam | EChartsTooltipParam[],
): C3TooltipDataItem[] => {
  const items = Array.isArray(params) ? params : [params];

  return items.map((item) => ({
    index: item.dataIndex ?? 0,
    id: getSeriesKey(item),
    value: getParamValue(item),
    name: item.name,
  }));
};

const toC3ColorFn =
  (params: EChartsTooltipParam | EChartsTooltipParam[]): C3ColorFn =>
  (id: string) => {
    const items = Array.isArray(params) ? params : [params];
    const match = items.find((item) => getSeriesKey(item) === id);
    return match?.color;
  };

/**
 * Maps defect / series keys to colors from a palette object or resolver.
 * When `defectTypes` is provided, falls back to `getItemColor` for unresolved keys.
 */
export const buildColorMap = (
  keys: string[],
  palette: ColorPalette = {},
  defectTypes?: Record<string, Array<{ locator: string; color: string }>>,
): Record<string, string> =>
  keys.reduce<Record<string, string>>((acc, key) => {
    if (typeof palette === 'function') {
      const color = palette(key);
      if (color) {
        acc[key] = color;
      }
      return acc;
    }

    if (palette[key]) {
      acc[key] = palette[key];
      return acc;
    }

    if (defectTypes) {
      acc[key] = getItemColor(key, defectTypes);
    }

    return acc;
  }, {});

/**
 * Adapts existing C3-style tooltip calculators / React tooltip components
 * to an ECharts `tooltip.formatter` that returns static HTML.
 */
export const buildTooltipFormatter = (
  TooltipComponent: TooltipComponentType,
  paramsCalculator: TooltipParamsCalculator,
  extraData: Record<string, unknown> = {},
) => {
  const c3Contents = createTooltipRenderer(TooltipComponent, paramsCalculator, extraData);

  return (params: EChartsTooltipParam | EChartsTooltipParam[]): string =>
    c3Contents(toC3TooltipData(params), null, null, toC3ColorFn(params));
};

export const buildAxisTicks = (count: number, isTimeline = false): number[] =>
  isTimeline ? getTimelineAxisTicks(count) : getLaunchAxisTicks(count);

export const buildLegendItems = (keys: string[]): string[] => [...keys];

/** Shared visual defaults aligned with current C3 chart look. */
export const ECHARTS_THEME: EChartsOption = {
  color: [],
  textStyle: {
    fontFamily: 'OpenSans, sans-serif',
    fontSize: 10,
    fontWeight: 400,
    color: COLOR_CHARCOAL_GREY,
  },
  grid: {
    containLabel: true,
    left: 40,
    right: 20,
    top: 20,
    bottom: 10,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: COLOR_WHITE_TWO,
    borderWidth: 0,
    extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); padding: 0;',
    textStyle: {
      fontFamily: 'OpenSans, sans-serif',
      fontSize: 12,
      fontWeight: 400,
      color: COLOR_CHARCOAL_GREY,
    },
  },
  legend: {
    show: false,
  },
};
