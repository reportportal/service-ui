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
import { FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { COLOR_CHART_NON_PASSED } from 'common/constants/colors';
import { getOption, getAxesUpdate } from './config/getOption';
import styles from './nonPassedTestCasesTrendChart.scss';

const cx = classNames.bind(styles);

const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';
const STATUSES_LINK_PARAMS = { statuses: [FAILED, SKIPPED, INTERRUPTED], types: null };

export const NonPassedTestCasesTrendChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
}) => {
  const { formatMessage } = useIntl();
  const onChartClick = useTrendChartClickNavigation(widget, STATUSES_LINK_PARAMS);

  const configData = useMemo(
    () => ({
      getOption,
      onChartClick,
      formatMessage,
    }),
    [formatMessage, onChartClick],
  );

  const chartRef = useRef(null);
  const content = widget.content?.result;

  const onChartCreated = useCallback((_node, chart) => {
    chartRef.current = chart;
  }, []);

  const onResized = useCallback(() => {
    const chart = chartRef.current;
    if (!chart || !content?.length) return;
    chart.setOption(getAxesUpdate(content, { width: chart.getWidth() }));
  }, [content]);

  const legendConfig = useMemo(
    () => ({
      showLegend: true,
      legendProps: {
        className: cx('legend'),
        getColor: () => COLOR_CHART_NON_PASSED,
        items: [FAILED_SKIPPED_STATISTICS_KEY],
        disabled: true,
      },
    }),
    [],
  );

  return (
    <div className={cx('non-passed-cases-trend-chart')}>
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

NonPassedTestCasesTrendChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
};