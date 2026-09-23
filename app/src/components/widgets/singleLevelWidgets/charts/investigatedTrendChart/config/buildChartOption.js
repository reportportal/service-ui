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

import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import {
  buildCategoryXAxis,
  buildItemTooltip,
  buildValueYAxis,
} from '../../common/echartsAxisBuilders';
import { AXIS_LABEL_STYLE } from '../../common/stackedBarSeries';
import { calculateTooltipParams, localMessages } from './utils';

export const buildInvestigatedChartOption = ({
  isPreview,
  categories,
  tickValues,
  series,
  colors,
  legendItems,
  itemsData,
  formatMessage,
  gridRight = 20,
  tooltipExtra = {},
}) => ({
  color: legendItems.map((name) => colors[name]),
  textStyle: AXIS_LABEL_STYLE,
  grid: {
    top: isPreview ? 0 : 85,
    left: isPreview ? 0 : 60,
    right: isPreview ? 0 : gridRight,
    bottom: isPreview ? 0 : 40,
    containLabel: false,
  },
  xAxis: buildCategoryXAxis({
    show: !isPreview,
    data: categories,
    onZero: true,
    axisLabelInterval: (index) => tickValues.includes(index),
  }),
  yAxis: buildValueYAxis({
    show: !isPreview,
    name: isPreview ? undefined : formatMessage(localMessages.yAxisInvestigationsTitle),
  }),
  tooltip: buildItemTooltip({
    show: !isPreview,
    formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
      itemsData,
      formatMessage,
      ...tooltipExtra,
    }),
  }),
  legend: {
    show: false,
  },
  series,
  customData: {
    itemsData,
    colors,
    legendItems,
  },
});
