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

import * as COLORS from 'common/constants/colors';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { STATS_PASSED, STATS_FAILED } from 'common/constants/statistics';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { IssueTypeStatTooltip } from '../../issueTypeStatTooltip';
import { STACKED_BAR_EMPHASIS } from '../../stackedBarSeries';
import { buildItemTooltip } from '../../echartsAxisBuilders';
import { getPercentage, calculateTooltipParams } from './utils';

export const NOT_PASSED_STATISTICS_KEY = 'statistics$executions$notPassed';

const LABEL_STYLE = {
  color: '#fff',
  fontSize: 13,
  fontFamily: 'OpenSans',
  fontWeight: 600,
};

const buildTooltipFormatter = (totalItems, formatMessage) => {
  const renderTooltip = createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
    totalItems,
    formatMessage,
  });

  return (params) => {
    const item = Array.isArray(params) ? params[0] : params;
    // For bar: item.seriesId holds the series id (stat key).
    // For pie/donut: item.seriesId is auto-generated; item.name is the data slice name (stat key).
    const statKey = item.seriesType === 'pie' ? item.name : (item.seriesId || item.name || '');
    const value = typeof item.value === 'number' ? item.value : 0;
    const data = [{ index: 0, id: statKey, value, name: statKey }];
    return renderTooltip(data, null, null, () => item.color);
  };
};

const buildBarOption = ({ isPreview, passedValue, notPassedValue, statisticKey, colors, totalItems, formatMessage }) => ({
  grid: {
    top: isPreview ? 0 : 30,
    left: isPreview ? 0 : 20,
    right: isPreview ? 0 : 20,
    bottom: isPreview ? 0 : 0,
    containLabel: false,
  },
  xAxis: {
    type: 'value',
    show: false,
    max: totalItems > 0 ? totalItems : undefined,
  },
  yAxis: {
    type: 'category',
    show: false,
    data: [''],
  },
  series: [
    {
      id: STATS_PASSED,
      name: STATS_PASSED,
      type: 'bar',
      stack: 'total',
      data: [passedValue],
      barWidth: '35%',
      barCategoryGap: '65%',
      itemStyle: { color: colors[STATS_PASSED] },
      label: {
        show: !isPreview && passedValue > 0,
        position: 'inside',
        formatter: () => `${getPercentage(passedValue, totalItems)}%`,
        ...LABEL_STYLE,
      },
      emphasis: STACKED_BAR_EMPHASIS,
    },
    {
      id: statisticKey,
      name: statisticKey,
      type: 'bar',
      stack: 'total',
      data: [notPassedValue],
      barWidth: '35%',
      barCategoryGap: '65%',
      itemStyle: { color: colors[statisticKey] },
      label: {
        show: !isPreview && notPassedValue > 0,
        position: 'inside',
        formatter: () => `${getPercentage(notPassedValue, totalItems)}%`,
        ...LABEL_STYLE,
      },
      emphasis: STACKED_BAR_EMPHASIS,
    },
  ],
  tooltip: buildItemTooltip({
    show: !isPreview,
    formatter: buildTooltipFormatter(totalItems, formatMessage),
  }),
  legend: { show: false },
  customData: {
    colors,
    legendItems: [STATS_PASSED, statisticKey],
  },
});

// The legend is position:absolute with height 85px on top of the canvas.
// We compute center/radius so the circle fits entirely in the area below it.
const LEGEND_HEIGHT_PX = 85;

const buildPieOption = ({
  isPreview,
  viewMode,
  passedValue,
  notPassedValue,
  statisticKey,
  colors,
  totalItems,
  formatMessage,
  size,
}) => {
  const isDonut = viewMode === MODES_VALUES[CHART_MODES.DONUT_VIEW];

  // Assuming landscape orientation (width >= height), min(W,H) = H, so radius % is of H/2.
  const containerHeight = size?.height ?? 320;
  const usableHeight = Math.max(containerHeight - LEGEND_HEIGHT_PX, 0);
  // Center of the usable area below the legend.
  const centerYPct = Math.round(((LEGEND_HEIGHT_PX + usableHeight / 2) / containerHeight) * 100);
  // Outer radius: fill 95% of the half-usable-height, expressed as % of H/2.
  const outerPct = Math.max(20, Math.round((usableHeight / 2 / (containerHeight / 2)) * 91));
  // Preserve the original inner/outer ratio (51/86 ≈ 0.593) for the donut hole.
  const innerPct = isDonut ? Math.round(outerPct * (51 / 86)) : 0;
  const radius = [`${innerPct}%`, `${outerPct}%`];

  return {
    series: [
      {
        type: 'pie',
        radius,
        center: ['50%', `${centerYPct}%`],
        avoidLabelOverlap: false,
        silent: isPreview,
        label: {
          show: !isPreview,
          position: 'inside',
          formatter: (params) =>
            params.percent < 5 ? '' : `${getPercentage(params.value, totalItems)}%`,
          ...LABEL_STYLE,
        },
        labelLine: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: isPreview ? 0 : 2 },
        emphasis: { scale: !isPreview, scaleSize: 4 },
        data: [
          {
            id: STATS_PASSED,
            name: STATS_PASSED,
            value: passedValue,
            itemStyle: { color: colors[STATS_PASSED] },
          },
          {
            id: statisticKey,
            name: statisticKey,
            value: notPassedValue,
            itemStyle: { color: colors[statisticKey] },
          },
        ],
      },
    ],
    tooltip: {
      trigger: 'item',
      show: !isPreview,
      formatter: buildTooltipFormatter(totalItems, formatMessage),
    },
    legend: { show: false },
    customData: {
      colors,
      legendItems: [STATS_PASSED, statisticKey],
    },
  };
};

export const getOption = ({ content, isPreview, formatMessage, viewMode, excludeSkipped, size }) => {
  const totalItems = excludeSkipped ? content.total - (content.skipped ?? 0) : content.total;
  const statisticKey = excludeSkipped ? STATS_FAILED : NOT_PASSED_STATISTICS_KEY;
  const passedValue = content.passed ?? 0;
  const notPassedValue = totalItems - passedValue;

  const colors = {
    [STATS_PASSED]: COLORS.COLOR_PASSED,
    [statisticKey]: COLORS.COLOR_NOTPASSED,
  };

  if (viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW]) {
    return buildBarOption({
      isPreview,
      passedValue,
      notPassedValue,
      statisticKey,
      colors,
      totalItems,
      formatMessage,
    });
  }

  return buildPieOption({
    isPreview,
    viewMode,
    passedValue,
    notPassedValue,
    statisticKey,
    colors,
    totalItems,
    formatMessage,
    size,
  });
};
