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

import { useCallback, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import type { EChartsType } from 'echarts/core';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { COLOR_CHART_PASSED, COLOR_CHART_FAILED } from 'common/constants/colors';
import { STATS_FAILED, STATS_PASSED } from 'common/constants/statistics';
import { EChart } from 'components/widgets/common/echarts';
import type {
  ChartObserver,
  EChartConfigData,
  WidgetLike,
} from 'components/widgets/common/echarts/types';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getOption, NOT_PASSED_STATISTICS_KEY } from './config/getOption';
import styles from './passingRateChart.scss';

const cx = classNames.bind(styles);

const getLegendColor = (name: string): string =>
  name === STATS_PASSED ? COLOR_CHART_PASSED : COLOR_CHART_FAILED;

interface PassingRateChartWidget extends WidgetLike {
  contentParameters: {
    widgetOptions: {
      excludeSkipped?: boolean;
      viewMode: string;
    };
  };
}

export interface PassingRateChartProps {
  widget: PassingRateChartWidget;
  container: Element;
  isPreview?: boolean;
  observer?: ChartObserver;
  filterNameTitle?: MessageDescriptor;
  filterName?: string;
  onChartClick?: (data: { id: string }) => void;
}

export const PassingRateChart = ({
  widget,
  container,
  isPreview = false,
  observer = {} as ChartObserver,
  filterNameTitle = {},
  filterName = '',
  onChartClick = () => {},
}: PassingRateChartProps) => {
  const { formatMessage } = useIntl();
  const chartRef = useRef<EChartsType | null>(null);
  const { excludeSkipped, viewMode } = widget.contentParameters.widgetOptions;
  const isBarMode = viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW];
  const statisticKey = excludeSkipped ? STATS_FAILED : NOT_PASSED_STATISTICS_KEY;

  const onChartCreated = useCallback((_: HTMLElement, chart: EChartsType) => {
    chartRef.current = chart;
  }, []);

  // Pie/donut: register click directly so params.name (slice name = stat key)
  // is used, not params.seriesId which resolves to the series-level id.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || chart.isDisposed() || isPreview || isBarMode) {
      return undefined;
    }

    const handleClick = (params: { componentType?: string; name?: string }) => {
      if (params.componentType === 'series') {
        onChartClick({ id: params.name });
      }
    };

    chart.on('click', handleClick);
    return () => {
      if (!chart.isDisposed()) {
        chart.off('click', handleClick);
      }
    };
  }, [isBarMode, isPreview, onChartClick]);

  const customBlock = useMemo(
    () => (
      <div className={cx('filter-info-block')}>
        {filterNameTitle?.id && (
          <span className={cx('filter-name-title')}>{formatMessage(filterNameTitle)}</span>
        )}
        <span className={cx('filter-name')}>{filterName}</span>
      </div>
    ),
    [filterName, filterNameTitle, formatMessage],
  );

  const configData: EChartConfigData = useMemo(
    () => ({
      getOption: getOption as unknown as EChartConfigData['getOption'],
      formatMessage,
      viewMode,
      excludeSkipped,
      tooltipClassName: cx('tooltip'),
      ...(isBarMode ? { onChartClick } : {}),
    }),
    [excludeSkipped, formatMessage, isBarMode, onChartClick, viewMode],
  );

  const legendConfig = useMemo(
    () => ({
      showLegend: true,
      legendProps: {
        items: [STATS_PASSED, statisticKey],
        disabled: true,
        itemClassName: cx('legend-item'),
        markClassName: cx('legend-mark'),
        labelClassName: cx('legend-label'),
        getColor: getLegendColor,
        customBlock,
      },
    }),
    [customBlock, statisticKey],
  );

  return (
    <div className={cx('passing-rate-chart', viewMode)}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset: 0 })}
        legendConfig={legendConfig}
        configData={configData}
        chartCreatedCallback={onChartCreated}
      />
    </div>
  );
};
