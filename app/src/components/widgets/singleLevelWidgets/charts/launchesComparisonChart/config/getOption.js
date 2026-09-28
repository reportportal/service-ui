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

import { defineMessages } from 'react-intl';
import { getItemColor, transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { buildTooltipFormatter } from 'components/widgets/common/echarts/configHelpers';
import { AXIS_LABEL_STYLE, createBarSeries } from '../../common/stackedBarSeries';
import {
  buildCategoryXAxis,
  buildItemTooltip,
  buildValueYAxis,
} from '../../common/echartsAxisBuilders';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from './utils';

const messages = defineMessages({
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
  },
});

const TOTAL_EXECUTIONS_KEY = 'statistics$executions$total';

export const getOption = ({
  content,
  contentFields,
  isPreview,
  formatMessage,
  defectTypes,
  onChartClick,
  uncheckedLegendItems = [],
}) => {
  const itemsData = [];
  const dataByName = {};
  const colors = {};

  contentFields.forEach((key) => {
    dataByName[key] = [];
    colors[key] = getItemColor(key, defectTypes);
  });

  content.forEach((item) => {
    itemsData.push({
      id: item.id,
      name: item.name,
      number: item.number,
      startTime: item.startTime,
    });
    contentFields.forEach((key) => {
      dataByName[key].push(Number(item.values[key] || 0));
    });
  });

  const itemNames = contentFields.filter((key) => key !== TOTAL_EXECUTIONS_KEY).reverse();
  // Unlike a stacked chart, these bars are grouped side by side, so how many
  // are checked changes how wide each one should be — dropping unchecked
  // ones here (rather than only toggling their series' visibility) lets
  // ECharts redistribute the freed-up width across what's left, instead of
  // leaving the remaining bars stuck at a fixed size.
  const plottedItemNames = itemNames.filter((name) => !uncheckedLegendItems.includes(name));
  const categories = itemsData.map(transformCategoryLabelByDefault);

  let gridTop = 85;
  if (isPreview) gridTop = 8;
  else if (!onChartClick) gridTop = 0;

  return {
    color: plottedItemNames.map((name) => colors[name]),
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: gridTop,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 8 : 40,
      containLabel: false,
    },
    xAxis: buildCategoryXAxis({
      show: !isPreview,
      data: categories,
      showAxisLine: false,
    }),
    yAxis: buildValueYAxis({
      show: !isPreview,
      name: isPreview ? undefined : `% ${formatMessage(messages.ofTestCases)}`,
    }),
    tooltip: buildItemTooltip({
      show: !isPreview,
      formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
        defectTypes,
      }),
    }),
    legend: {
      show: false,
    },
    series: createBarSeries(plottedItemNames, dataByName, colors, {
      barMinHeight: 1,
      // No fixed width: a fixed pixel doesn't fit the tiny preview thumbnail
      // once there's more than a couple of launches, and it also doesn't let
      // bars grow back to fill the freed-up space when items get unchecked
      // above — auto-dividing the category slot handles both.
      barCategoryGap: '45%',
      barGap: '0%',
      silent: isPreview,
    }),
    customData: {
      itemsData,
      colors,
      legendItems: itemNames,
    },
  };
};
