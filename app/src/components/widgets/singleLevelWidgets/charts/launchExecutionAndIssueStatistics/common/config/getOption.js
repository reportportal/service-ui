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

import { COLOR_WHITE_TWO } from 'common/constants/colors';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { buildCenterLabelGraphic } from 'components/widgets/common/echarts/centerLabelGraphic';
import { CHART_TOOLTIP_SHELL } from 'components/widgets/common/echarts/configHelpers';
import { IssueTypeStatTooltip } from '../../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from './utils';

// Outer radius is capped at 80%: ECharts sizes percentages off the shorter side, so with
// the center at 60% a 90% ring would overflow the bottom of a short box. Inner/outer 0.8 keeps
// the Figma ring proportion.
const DONUT_RADIUS = ['64%', '80%'];
const DONUT_CENTER_Y = 60;
const DONUT_RADIUS_SMALL = ['40%', '50%'];
const DONUT_CENTER_Y_SMALL = 70;
// Preview never has a legend to clear (see `centerY` below), so it can use
// more of its box than the general "small" ring size, which is sized to
// leave room for one. Same inner/outer ratio (0.8) as the full-widget ring.
const DONUT_RADIUS_PREVIEW = ['65.6%', '82%'];
const DONUT_CENTER_Y_PREVIEW = 50;
/**
 * `createTooltipRenderer` expects `{index, id, value, name}` data
 * and a `color(id)` lookup. A pie/donut chart has one series with many data
 * points, so — unlike the shared `buildTooltipFormatter` bridge, which reads
 * `seriesId`/`seriesName` first — the useful id here is always the hovered
 * slice's own `name`, read directly off the raw ECharts param.
 */
const buildDonutTooltipFormatter = (customProps) => {
  const renderTooltip = createTooltipRenderer(
    IssueTypeStatTooltip,
    calculateTooltipParams,
    customProps,
  );

  return (params) => {
    const item = Array.isArray(params) ? params[0] : params;
    const data = [{ index: item.dataIndex, id: item.name, value: item.value, name: item.name }];

    return renderTooltip(data, null, null, () => item.color);
  };
};

export const getOption = ({
  content,
  isPreview,
  formatMessage,
  contentFields,
  configParams: { getColumns, ...params },
  small = false,
  chartText = '',
  uncheckedLegendItems = [],
}) => {
  const { columns, colors } = getColumns(content, contentFields, params);
  const legendItems = columns.map(([id]) => id);
  const visibleColumns = columns.filter(([id]) => !uncheckedLegendItems.includes(id));
  const visibleTotal = visibleColumns.reduce((sum, [, value]) => sum + value, 0);
  const hasData = visibleTotal > 0;
  const plottedColumns = visibleColumns.filter(([, value]) => value > 0);
  // The center push-down only exists to clear the legend above the ring,
  // which never renders in preview, so preview is truly centered in its box.
  let centerY = small ? DONUT_CENTER_Y_SMALL : DONUT_CENTER_Y;
  if (isPreview) centerY = DONUT_CENTER_Y_PREVIEW;
  let radius = small ? DONUT_RADIUS_SMALL : DONUT_RADIUS;
  if (isPreview) radius = DONUT_RADIUS_PREVIEW;
  const pieData = plottedColumns.map(([id, value]) => ({
    id,
    name: id,
    value,
    itemStyle: { color: colors[id] },
  }));

  const ringSeries = {
    type: 'pie',
    radius,
    center: ['50%', `${centerY}%`],
    avoidLabelOverlap: false,
    silent: isPreview,
    label: {
      show: false,
    },
    labelLine: {
      show: false,
    },
    itemStyle: {
      borderColor: COLOR_WHITE_TWO,
      borderWidth: isPreview ? 0 : 2,
    },
    emphasis: {
      scale: false,
    },
    data: pieData,
  };

  const series = hasData ? [ringSeries] : [];

  return {
    color: columns.map(([id]) => colors[id]),
    series,
    tooltip: {
      trigger: 'item',
      show: !isPreview,
      formatter: buildDonutTooltipFormatter({
        ...params,
        total: visibleTotal,
        formatMessage,
        itemsData: content,
      }),
      ...CHART_TOOLTIP_SHELL,
    },
    legend: {
      show: false,
    },
    // A bit above the ring's own center: as a pair, the value/subtitle text
    // otherwise reads as sitting a bit low against the ring's visual middle.
    graphic: isPreview
      ? []
      : buildCenterLabelGraphic({
          value: visibleTotal,
          subtitle: chartText,
          small,
          centerY: centerY - 2,
        }),
    customData: {
      itemsData: content,
      colors,
      legendItems,
    },
  };
};
