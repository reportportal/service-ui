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

import moment from 'moment';
import { buildAxisTicks } from 'components/widgets/common/echarts/configHelpers';
import { COLORS } from 'components/widgets/common/constants';
import { buildInvestigatedChartOption, createStackedBarSeries } from './buildChartOption';

export const getTimelineOption = ({ content, isPreview, formatMessage }) => {
  const chartData = {};
  const colors = {};
  const itemsData = [];
  const data = Object.keys(content).map((key) => ({
    date: key,
    values: content[key].values,
  }));

  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();
    colors[shortKey] = COLORS[shortKey];
    chartData[shortKey] = [];
  });

  data.forEach((item) => {
    itemsData.push({
      date: item.date,
    });
    Object.keys(item.values).forEach((key) => {
      const shortKey = key.split('$').pop();
      chartData[shortKey].push(Number.parseFloat(item.values[key]));
    });
  });

  const itemNames = Object.keys(chartData);
  const categories = itemsData.map((item) => {
    const day = moment(item.date).format('dddd').substring(0, 3);
    return `${day}, ${item.date}`;
  });

  return buildInvestigatedChartOption({
    isPreview,
    categories,
    tickValues: buildAxisTicks(itemsData.length, true),
    series: createStackedBarSeries(itemNames, chartData, colors),
    colors,
    legendItems: itemNames,
    itemsData,
    formatMessage,
    gridRight: 30,
    tooltipExtra: { isTimeline: true },
  });
};
