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

import moment from 'moment';
import classNames from 'classnames/bind';
import { normalizeChartData } from 'components/widgets/common/utils';
import { TIMELINE_TOOLTIP_DATE_FORMAT } from '../constants';
import { getLaunchStatisticsColor } from '../chartColors';
import styles from '../launchStatisticsChart.scss';

const cx = classNames.bind(styles);

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
    colors[key] = getLaunchStatisticsColor(key, defectTypes);
  });

  widgetData
    .sort((a, b) => {
      const startTimeA = new Date(a.startTime);
      const startTimeB = new Date(b.startTime);
      return startTimeA - startTimeB;
    })
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
  const { itemsData, formatMessage, defectTypes, isTimeline, realValues } = customProps;
  const { index, id } = data[0];
  // bars may be drawn with a minimum height, so show the real count, not the drawn value
  const value = realValues?.[id]?.[index] ?? data[0].value;
  const { name, number, startTime, date } = itemsData[index];

  return {
    itemName: isTimeline ? moment(date).format(TIMELINE_TOOLTIP_DATE_FORMAT) : `${name} #${number}`,
    startTime: isTimeline ? null : new Date(startTime).getTime(),
    itemCases: String(value), // string so a zero count is still rendered by the tooltip
    color: color(id),
    wrapperClassName: cx('tooltip'),
    issueStatNameProps: { itemName: id, defectTypes, formatMessage },
  };
};
