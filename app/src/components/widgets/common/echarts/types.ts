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

import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import type { ComponentType, ReactNode } from 'react';

export type EChartsOption = EChartsCoreOption;

export interface WidgetLike {
  content?: {
    result?: unknown;
  };
  [key: string]: unknown;
}

export interface ChartObserver {
  subscribe: (event: string, callback: () => void) => void;
  unsubscribe: (event: string, callback: () => void) => void;
}

export interface LegendConfig {
  showLegend?: boolean;
  onChangeLegend?: (id: string, callback?: () => void) => void;
  uncheckedLegendItems?: string[];
  legendProps?: Record<string, unknown>;
}

export interface EChartCustomData {
  legendItems?: string[];
  colors?: Record<string, string>;
  [key: string]: unknown;
}

export type EChartOptionResult = EChartsOption & {
  customData?: EChartCustomData;
};

export type GetOptionParams = {
  content: unknown;
  isPreview: boolean;
  size: { height: number };
  [key: string]: unknown;
};

export interface EChartConfigData {
  getOption: (params: GetOptionParams) => EChartOptionResult;
  [key: string]: unknown;
}

export interface EChartProps {
  widget?: WidgetLike;
  container?: Element;
  isPreview?: boolean;
  heightOffset?: number;
  observer?: ChartObserver;
  configData?: EChartConfigData;
  option?: EChartsOption;
  legendConfig?: LegendConfig;
  chartCreatedCallback?: (
    element: HTMLElement,
    chart: EChartsType,
    customData?: EChartCustomData,
  ) => void;
  onChartReady?: (chart: EChartsType) => void;
  className?: string;
  resizedCallback?: () => void;
  children?: ReactNode;
}

export type ColorPalette = Record<string, string> | ((key: string) => string);

export type C3TooltipDataItem = {
  index: number;
  id: string;
  value: number | string | null;
  name?: string;
};

export type C3ColorFn = (id: string) => string | undefined;

export type TooltipParamsCalculator = (
  data: C3TooltipDataItem[],
  color: C3ColorFn,
  customProps: Record<string, unknown>,
) => Record<string, unknown>;

export type TooltipComponentType = ComponentType<Record<string, unknown>>;
