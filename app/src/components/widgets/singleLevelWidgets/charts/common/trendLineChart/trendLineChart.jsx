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

import { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { EChart } from 'components/widgets/common/echarts';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { useTrendChartClickNavigation } from 'components/widgets/common/utils/useTrendChartClickNavigation';
import styles from './trendLineChart.scss';

const cx = classNames.bind(styles);

/**
 * Shared renderer for single-series "line per launch" trend charts. Widgets pass
 * their `getOption` / `getAxesUpdate` (recalculates axes on resize), the statuses
 * used for the click drill-down and the single legend item with its colour.
 * `statusesLinkParams` and `legendItem` should be stable (module-level) references.
 */
export const TrendLineChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
  getOption,
  getAxesUpdate,
  statusesLinkParams,
  legendItem,
  legendColor,
}) => {
  const { formatMessage } = useIntl();
  const onChartClick = useTrendChartClickNavigation(widget, statusesLinkParams);

  const configData = useMemo(
    () => ({
      getOption,
      onChartClick,
      formatMessage,
    }),
    [getOption, formatMessage, onChartClick],
  );

  const chartRef = useRef(null);
  const content = widget.content?.result;

  const onChartCreated = useCallback((_node, chart) => {
    chartRef.current = chart;
  }, []);

  const onResized = useCallback(() => {
    const chart = chartRef.current;
    if (!chart || !content?.length) return;
    chart.setOption(getAxesUpdate(content, { width: chart.getWidth(), height: chart.getHeight() }));
  }, [content, getAxesUpdate]);

  const legendConfig = useMemo(
    () => ({
      showLegend: true,
      legendProps: {
        className: cx('legend'),
        getColor: () => legendColor,
        items: [legendItem],
        disabled: true,
      },
    }),
    [legendItem, legendColor],
  );

  return (
    <div className={cx('trend-line-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        configData={configData}
        legendConfig={legendConfig}
        chartCreatedCallback={onChartCreated}
        resizedCallback={onResized}
      />
    </div>
  );
};

TrendLineChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
  getOption: PropTypes.func.isRequired,
  getAxesUpdate: PropTypes.func.isRequired,
  statusesLinkParams: PropTypes.object.isRequired,
  legendItem: PropTypes.string.isRequired,
  legendColor: PropTypes.string.isRequired,
};
