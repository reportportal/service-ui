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
import { buildCenterLabelGraphic } from 'components/widgets/common/echarts/centerLabelGraphic';
import { IssueTypeStatTooltip } from '../../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from './utils';

const DONUT_RADIUS = ['51%', '86%'];
// Nudges the ring down a bit so the top of the donut doesn't sit flush
// against the legend/title above it.
const DONUT_CENTER_Y = 60;
// The center value/subtitle text sits a bit higher than the ring's own
// center — kept as its own constant so the two can be tuned independently.
const DONUT_LABEL_CENTER_Y = DONUT_CENTER_Y - 4;

/**
 * `createTooltipRenderer` expects C3-shaped `{index, id, value, name}` data
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
  const total = columns.reduce((sum, [, value]) => sum + value, 0);
  // Mirrors the old C3 behavior (`chart.data.shown().reduce(...)`): the center
  // total and tooltip percentages reflect only the currently checked legend
  // items, not the full dataset, so unchecking a status/defect type updates
  // the number instead of leaving it stuck at the full total.
  const visibleTotal = columns.reduce(
    (sum, [id, value]) => (uncheckedLegendItems.includes(id) ? sum : sum + value),
    0,
  );
  // Nothing to plot: omit the pie series entirely (not just empty `data`) so
  // nothing — not even an empty gray ring — renders. Only the center
  // total/subtitle graphic is left showing.
  const hasData = total > 0;

  return {
    color: columns.map(([id]) => colors[id]),
    series: hasData
      ? [
          {
            type: 'pie',
            radius: DONUT_RADIUS,
            center: ['50%', `${DONUT_CENTER_Y}%`],
            avoidLabelOverlap: false,
            silent: isPreview,
            label: {
              show: !isPreview && !small,
              position: 'inside',
              // `{d}%` rounds to a whole number; a formatter function gives
              // one decimal place instead (e.g. "100.0%", not "100%").
              formatter: (params) => `${params.percent.toFixed(1)}%`,
              color: '#fff',
              fontSize: 13,
              fontWeight: 400,
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: isPreview ? 0 : 2,
            },
            emphasis: {
              scale: !isPreview,
              scaleSize: 4,
            },
            data: columns.map(([id, value]) => ({
              id,
              name: id,
              value,
              itemStyle: { color: colors[id] },
            })),
          },
        ]
      : [],
    tooltip: {
      trigger: 'item',
      show: !isPreview,
      formatter: buildDonutTooltipFormatter({ ...params, total: visibleTotal, formatMessage }),
    },
    legend: {
      show: false,
    },
    graphic: isPreview
      ? []
      : buildCenterLabelGraphic({
          value: visibleTotal,
          subtitle: chartText,
          small,
          centerY: DONUT_LABEL_CENTER_Y,
        }),
    customData: {
      itemsData: content,
      colors,
      legendItems,
    },
  };
};
