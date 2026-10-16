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

const DONUT_RADIUS = ['40%', '68%'];
const DONUT_CENTER_Y = 60;
const DONUT_RADIUS_SMALL = ['30%', '50%'];
const DONUT_CENTER_Y_SMALL = 70;
// Preview never has a legend to clear (see `centerY` below), so it can use
// more of its box than the general "small" ring size, which is sized to
// leave room for one — bigger overall, and a bit thinner (a smaller gap
// between the two radii) than the full-widget ring.
const DONUT_RADIUS_PREVIEW = ['48%', '82%'];
const DONUT_CENTER_Y_PREVIEW = 50;
// ECharts always places `inside` pie labels at the exact middle of the ring
// band, with no setting to shift them along the radius. To pull the slice
// percentages a bit closer to the center without changing the visible ring,
// they're drawn on a second, invisible pie whose band is biased inward
// (mid-radius 52% instead of the ring's 54%).
const DONUT_LABEL_RADIUS = ['40%', '64%'];

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
  const showSliceLabels = !isPreview && !small;
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
      borderColor: '#fff',
      borderWidth: isPreview ? 0 : 2,
    },
    emphasis: {
      // Only when the ring is the sole series (small view): when the
      // percentage labels are drawn by the separate `sliceLabelSeries`
      // below, that series doesn't grow with the ring on hover (it's
      // silent/emphasis-disabled, so it can't react to the ring's hover
      // state), so scaling the ring here would visibly detach the label
      // from its slice for as long as it's hovered.
      scale: !isPreview && !showSliceLabels,
      scaleSize: 4,
    },
    data: pieData,
  };

  const sliceLabelSeries = {
    type: 'pie',
    radius: DONUT_LABEL_RADIUS,
    center: ['50%', `${centerY}%`],
    avoidLabelOverlap: false,
    // Purely a label carrier: never hit-tested, so hover, tooltip and clicks
    // all go to the real ring underneath.
    silent: true,
    z: 3,
    label: {
      show: true,
      position: 'inside',
      // `{d}%` rounds to a whole number; a formatter function gives
      // one decimal place instead (e.g. "100.0%", not "100%").
      formatter: (params) => `${params.percent.toFixed(1)}%`,
      color: '#fff',
      fontSize: 13,
      fontWeight: 400,
      align: 'center',
      verticalAlign: 'middle',
    },
    labelLine: {
      show: false,
    },
    itemStyle: {
      color: 'transparent',
      borderWidth: 0,
    },
    emphasis: {
      disabled: true,
    },
    data: pieData.map(({ id, name, value }) => ({ id, name, value })),
  };

  let series = [];
  if (hasData) series = showSliceLabels ? [ringSeries, sliceLabelSeries] : [ringSeries];

  return {
    color: columns.map(([id]) => colors[id]),
    series,
    tooltip: {
      trigger: 'item',
      show: !isPreview,
      formatter: buildDonutTooltipFormatter({ ...params, total: visibleTotal, formatMessage }),
    },
    legend: {
      show: false,
    },
    // Shown in preview too (a thumbnail with no numbers in it isn't a
    // meaningful preview) — always at the smaller font size there, since
    // the bigger preview ring (see `DONUT_RADIUS_PREVIEW`) leaves less
    // room in the hole for it than `small`'s own container-size check
    // would otherwise assume.
    graphic: buildCenterLabelGraphic({
      value: visibleTotal,
      subtitle: chartText,
      small: small || isPreview,
      // A bit above the ring's own center — as a pair, the value/subtitle
      // text otherwise reads as sitting a bit low against the ring's
      // visual middle. Preview's bigger ring (see `DONUT_RADIUS_PREVIEW`)
      // needs a bit more of a nudge than the full widget.
      centerY: isPreview ? centerY - 4 : centerY - 2,
      // Preview's ring/hole is bigger (see `DONUT_RADIUS_PREVIEW`) so it can
      // take a bit more breathing room between the two lines; the full
      // widget keeps the tighter default gap.
      gap: isPreview ? 6 : 4,
      // Smaller than the general `small` tier (15/13) — preview is a fixed,
      // tiny thumbnail regardless of how `small` was computed.
      valueFontSize: isPreview ? 12 : undefined,
      subtitleFontSize: isPreview ? 10 : undefined,
    }),
    customData: {
      itemsData: content,
      colors,
      legendItems,
    },
  };
};
