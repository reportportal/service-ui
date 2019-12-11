/*
 * Copyright 2019 EPAM Systems
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

import { normalizeChartData, getItemColor } from 'components/widgets/common/utils';
import { messages } from 'components/widgets/common/messages';

export const isSingleColumnChart = (content, isTimeLine) => {
  const data = normalizeChartData(content.result, isTimeLine);

  return data.length < 2;
};

export const getConfigData = (
  data,
  { defectTypes, orderedContentFields, contentFields, isTimeline },
) => {
  const widgetData = normalizeChartData(data, isTimeline);
  const itemsData = [];
  const chartData = {};
  const chartDataOrdered = [];
  const colors = {};

  contentFields.forEach((key) => {
    chartData[key] = [key];
    colors[key] = getItemColor(key, defectTypes);
  });

  widgetData
    .sort((a, b) => a.startTime - b.startTime)
    .forEach((item) => {
      const currentItemData = {
        ...item,
      };
      delete currentItemData.values;
      itemsData.push(currentItemData);

      contentFields.forEach((contentFieldKey) => {
        const value = Number(item.values[contentFieldKey]) || 0;
        chartData[contentFieldKey].push(value);
      });
    });

  orderedContentFields
    .filter((name) => contentFields.indexOf(name) !== -1)
    .forEach((key) => {
      chartDataOrdered.push(chartData[key]);
    });

  const itemNames = chartDataOrdered.map((item) => item[0]);

  return {
    itemsData,
    chartDataOrdered,
    itemNames,
    colors,
  };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, defectTypes, isTimeline } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime, date } = itemsData[index];

  return {
    itemName: isTimeline ? date : `${name} #${number}`,
    startTime: isTimeline ? null : Number(startTime),
    itemCases: `${value} ${formatMessage(messages.cases)}`,
    color: color(id),
    issueStatNameProps: { itemName: id, defectTypes, formatMessage },
  };
};
