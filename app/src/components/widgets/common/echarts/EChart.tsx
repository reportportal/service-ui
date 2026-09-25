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
import { CustomChart } from 'echarts/charts';
import { createClassnames } from 'common/utils';
import { Legend } from 'components/widgets/common/legend';
import { echarts } from './echartsSetup';
import { ECHARTS_THEME } from './configHelpers';

echarts.use([CustomChart]);
import { crispSvgSplitLines } from './crispSvgSplitLines';
import type { EChartCustomData, EChartOptionResult, EChartProps, EChartsOption } from './types';
import styles from './EChart.scss';

const cx = createClassnames(styles);

const DEFAULT_LEGEND_CONFIG = {
  showLegend: false,
  onChangeLegend: () => {},
  uncheckedLegendItems: [] as string[],
  legendProps: {} as Record<string, unknown>,
};

const mergeOption = (option: EChartsOption): EChartsOption => {
  const themeGrid = ECHARTS_THEME.grid as object;
  const themeLegend = ECHARTS_THEME.legend as object;

  const grid = Array.isArray(option.grid)
    ? option.grid.map((item): object => ({ ...themeGrid, ...(item as object) }))
    : { ...themeGrid, ...(option.grid as object) };

  const legend = Array.isArray(option.legend)
    ? option.legend.map((item): object => ({
        ...themeLegend,
        ...(item as object),
        show: false,
      }))
    : { ...themeLegend, ...(option.legend as object), show: false };

  return {
    ...ECHARTS_THEME,
    ...option,
    textStyle: {
      ...ECHARTS_THEME.textStyle,
      ...option.textStyle,
    },
    grid,
    tooltip: {
      ...(ECHARTS_THEME.tooltip as object),
      ...(option.tooltip as object),
    },
    legend,
  };
};

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
        renderer: 'svg',
      });
      chartRef.current = chart;
      chartCreatedCallbackRef.current(node, chart, customDataRef.current);
      onChartReadyRef.current(chart);
    }

    chart.setOption(built.option, { notMerge: true });

    if (!isPreview && showLegend && !(legendProps as { disabled?: boolean }).disabled) {
      uncheckedLegendItems.forEach((name) => {
        chart.dispatchAction({ type: 'legendUnSelect', name });
      });
    }

    requestAnimationFrame(() => {
      crispSvgSplitLines(chart);
    });

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
      if (!chart || typeof chart.resize !== 'function') {
        return;
      }

      try {
        const height = container
          ? Math.max(container.clientHeight - heightOffset, 0)
          : undefined;
        chart.resize(height !== undefined ? { height } : undefined);
        requestAnimationFrame(() => {
          if (chartRef.current === chart) {
            crispSvgSplitLines(chart);
          }
        });
        resizedCallbackRef.current?.();
      } catch {
        // Chart may already be disposed while ResizeObserver is flushing
      }
    });

    resizeObserver.observe(resizeTarget);

    return () => {
      resizeObserver.disconnect();
    };
  }, [container, heightOffset]);

  useEffect(() => {
    const chart = chartRef.current;
    const node = chartNodeRef.current;
    const onChartClick = configData?.onChartClick as
      | ((params: Record<string, unknown>) => void)
      | undefined;

    if (!chart || !node || !onChartClick || isPreview) {
      return undefined;
    }

    const resolveAxisIndex = (offsetX: number): number | null => {
      try {
        const axisIndex = chart.convertFromPixel({ xAxisIndex: 0 }, offsetX);
        return Number.isInteger(axisIndex) ? axisIndex : null;
      } catch {
        return null;
      }
    };

    const seriesList =
      (built?.option?.series as Array<{ id?: string; name?: string; data?: unknown[] }> | undefined) ??
      [];

    if (seriesList.length === 1) {
      const [series] = seriesList;
      const seriesId = series.id ?? series.name;
      const dataLen = series.data?.length ?? 0;

      const handleDomClick = (event: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        let insideGrid = true;
        try {
          insideGrid = chart.containPixel({ gridIndex: 0 }, [offsetX, offsetY]);
        } catch {
          insideGrid = true;
        }
        if (!insideGrid) {
          return;
        }

        let index: number | null = null;
        try {
          const axisValue = chart.convertFromPixel({ xAxisIndex: 0 }, offsetX);
          if (Number.isFinite(axisValue)) {
            const rounded = Math.round(axisValue);
            if (rounded >= 0 && rounded < dataLen) {
              index = rounded;
            }
          }
        } catch {
          // ignore
        }

        if (index === null) {
          return;
        }

        onChartClick({
          index,
          id: seriesId,
          value: series.data?.[index],
          name: undefined,
        });
      };

      node.addEventListener('click', handleDomClick);

      return () => {
        node.removeEventListener('click', handleDomClick);
      };
    }

    const handleClick = (params: {
      dataIndex?: number;
      seriesId?: string;
      seriesName?: string;
      name?: string;
      value?: unknown;
      event?: { offsetX?: number; offsetY?: number };
    }) => {
      let index = params.dataIndex ?? 0;
      const offsetX = params.event?.offsetX;
      if (offsetX !== undefined) {
        const axisIndex = resolveAxisIndex(offsetX);
        if (axisIndex !== null) {
          index = axisIndex;
        }
      }

      onChartClick({
        index,
        id: params.seriesId || params.seriesName || params.name,
        value: params.value,
        name: params.name,
      });
    };

    chart.on('click', handleClick);

    return () => {
      chart.off('click', handleClick);
    };
  }, [built, configData?.onChartClick, isPreview]);

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
          uncheckedLegendItems={uncheckedLegendItems}
          onClick={onClickLegendItem}
          onMouseOver={onLegendMouseOver}
          onMouseOut={onLegendMouseOut}
        />
      )}
    </>
  );
};
