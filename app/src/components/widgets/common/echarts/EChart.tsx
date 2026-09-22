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

import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import type { EChartsType } from 'echarts/core';
import { createClassnames } from 'common/utils';
import { Legend } from 'components/widgets/common/legend';
import { echarts } from './echartsSetup';
import { ECHARTS_THEME } from './configHelpers';
import type { EChartCustomData, EChartOptionResult, EChartProps, EChartsOption } from './types';
import styles from './EChart.scss';

const cx = createClassnames(styles);

const DEFAULT_LEGEND_CONFIG = {
  showLegend: false,
  onChangeLegend: () => {},
  uncheckedLegendItems: [] as string[],
  legendProps: {} as Record<string, unknown>,
};

const mergeOption = (option: EChartsOption): EChartsOption => ({
  ...ECHARTS_THEME,
  ...option,
  textStyle: {
    ...ECHARTS_THEME.textStyle,
    ...(option.textStyle || {}),
  },
  grid: {
    ...(ECHARTS_THEME.grid as object),
    ...(option.grid as object),
  },
  tooltip: {
    ...(ECHARTS_THEME.tooltip as object),
    ...(option.tooltip as object),
  },
  legend: {
    ...(ECHARTS_THEME.legend as object),
    ...(option.legend as object),
    show: false,
  },
});

export const EChart = ({
  widget = {},
  container,
  isPreview = false,
  heightOffset = 0,
  configData,
  option: optionProp,
  legendConfig = DEFAULT_LEGEND_CONFIG,
  chartCreatedCallback = () => {},
  onChartReady = () => {},
  className = '',
  resizedCallback,
}: EChartProps): ReactElement | null => {
  const chartNodeRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const customDataRef = useRef<EChartCustomData>({});
  const chartCreatedCallbackRef = useRef(chartCreatedCallback);
  const onChartReadyRef = useRef(onChartReady);
  const resizedCallbackRef = useRef(resizedCallback);

  useEffect(() => {
    chartCreatedCallbackRef.current = chartCreatedCallback;
    onChartReadyRef.current = onChartReady;
    resizedCallbackRef.current = resizedCallback;
  }, [chartCreatedCallback, onChartReady, resizedCallback]);

  const {
    showLegend = false,
    onChangeLegend = DEFAULT_LEGEND_CONFIG.onChangeLegend,
    uncheckedLegendItems = [],
    legendProps = {},
  } = legendConfig;

  const built = useMemo(() => {
    if (optionProp) {
      return {
        option: mergeOption(optionProp),
        customData: {} as EChartCustomData,
        legendItems: [] as string[],
        colors: {} as Record<string, string>,
      };
    }

    if (!configData?.getOption || !container) {
      return null;
    }

    const { getOption, ...configParams } = configData;
    const height = Math.max(container.clientHeight - heightOffset, 0);
    const result: EChartOptionResult = getOption({
      content: widget.content?.result,
      isPreview,
      size: { height },
      ...configParams,
    });
    const { customData = {}, ...option } = result;

    return {
      option: mergeOption(option),
      customData,
      legendItems: customData.legendItems || [],
      colors: customData.colors || {},
    };
  }, [optionProp, configData, container, heightOffset, isPreview, widget]);

  useEffect(() => {
    const node = chartNodeRef.current;
    if (!node || !built?.option) {
      return undefined;
    }

    customDataRef.current = built.customData;

    let chart = chartRef.current;
    if (!chart) {
      const height = container
        ? Math.max(container.clientHeight - heightOffset, 0)
        : undefined;
      chart = echarts.init(node, undefined, {
        height,
        renderer: 'canvas',
      });
      chartRef.current = chart;
      chartCreatedCallbackRef.current(node, chart, customDataRef.current);
      onChartReadyRef.current(chart);

      if (!isPreview && showLegend && !(legendProps as { disabled?: boolean }).disabled) {
        uncheckedLegendItems.forEach((name) => {
          chart?.dispatchAction({ type: 'legendUnSelect', name });
        });
      }
    }

    chart.setOption(built.option, { notMerge: true });

    return undefined;
  }, [
    built,
    container,
    heightOffset,
    isPreview,
    showLegend,
    legendProps,
    uncheckedLegendItems,
  ]);

  useEffect(() => {
    const resizeTarget = container || chartNodeRef.current;
    if (!resizeTarget || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      const chart = chartRef.current;
      if (!chart) {
        return;
      }
      const height = container
        ? Math.max(container.clientHeight - heightOffset, 0)
        : undefined;
      chart.resize(height !== undefined ? { height } : undefined);
      resizedCallbackRef.current?.();
    });

    resizeObserver.observe(resizeTarget);

    return () => {
      resizeObserver.disconnect();
    };
  }, [container, heightOffset]);

  useEffect(
    () => () => {
      if (chartRef.current) {
        chartRef.current.dispose();
        chartRef.current = null;
      }
    },
    [],
  );

  const onLegendMouseOut = () => {
    chartRef.current?.dispatchAction({ type: 'downplay' });
  };

  const onLegendMouseOver = (id: string) => {
    chartRef.current?.dispatchAction({ type: 'highlight', seriesName: id });
  };

  const onClickLegendItem = (id: string) => {
    onChangeLegend(id);
    chartRef.current?.dispatchAction({ type: 'legendToggleSelect', name: id });
  };

  if (!built) {
    return null;
  }

  return (
    <>
      <div ref={chartNodeRef} className={cx('e-chart', className)} />
      {!isPreview && showLegend && (
        <Legend
          items={built.legendItems}
          colors={built.colors}
          {...legendProps}
          onClick={onClickLegendItem}
          onMouseOver={onLegendMouseOver}
          onMouseOut={onLegendMouseOut}
        />
      )}
    </>
  );
};
