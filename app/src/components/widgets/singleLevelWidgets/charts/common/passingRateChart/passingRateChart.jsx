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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { STATS_FAILED, STATS_PASSED } from 'common/constants/statistics';
import { EChart } from 'components/widgets/common/echarts';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getOption, NOT_PASSED_STATISTICS_KEY } from './config/getOption';
import styles from './passingRateChart.scss';

const cx = classNames.bind(styles);

export const PassingRateChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  filterNameTitle = {},
  filterName = '',
  onChartClick = () => {},
}) => {
  const { formatMessage } = useIntl();
  const chartRef = useRef(null);

  const { excludeSkipped, viewMode } = widget.contentParameters.widgetOptions;
  const isBarMode = viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW];
  const statisticKey = excludeSkipped ? STATS_FAILED : NOT_PASSED_STATISTICS_KEY;

  const onChartCreated = useCallback((_, chart) => {
    chartRef.current = chart;
  }, []);

  // Pie/donut: register click directly so params.name (slice name = stat key)
  // is used, not params.seriesId which resolves to the series-level id.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || chart.isDisposed() || isPreview || isBarMode) {
      return undefined;
    }

    const handleClick = (params) => {
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

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      viewMode,
      excludeSkipped,
      ...(isBarMode ? { onChartClick } : {}),
    }),
    [excludeSkipped, formatMessage, isBarMode, onChartClick, viewMode],
  );

  const legendConfig = useMemo(
    () => ({
      showLegend: true,
      legendProps: {
        items: [STATS_PASSED, statisticKey],
        clickable: false,
        customBlock,
      },
    }),
    [customBlock, statisticKey],
  );

  return (
    <div className={cx('passing-rate-chart', viewMode)}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer })}
        legendConfig={legendConfig}
        configData={configData}
        chartCreatedCallback={onChartCreated}
      />
    </div>
  );
};

PassingRateChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  filterNameTitle: PropTypes.object,
  filterName: PropTypes.string,
  onChartClick: PropTypes.func,
};
