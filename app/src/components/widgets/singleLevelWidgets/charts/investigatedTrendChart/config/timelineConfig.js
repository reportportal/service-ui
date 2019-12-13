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
import { getTimelineAxisTicks } from 'components/widgets/common/utils';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { COLORS } from '../../../../common/constants';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, localMessages } from './utils';

export const getTimelineConfig = ({
  content,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  onChartClick,
}) => {
  const chartData = {};
  const colors = {};
  const itemsData = [];
  const data = Object.keys(content).map((key) => ({
    date: key,
    values: content[key].values,
  }));

  // prepare columns array and fill it witch field names
  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();
    colors[shortKey] = COLORS[shortKey];
    chartData[shortKey] = [shortKey];
  });
  // fill columns arrays with values
  data.forEach((item) => {
    itemsData.push({
      date: item.date,
    });
    Object.keys(item.values).forEach((key) => {
      const splitted = key.split('$');
      const shortKey = splitted[splitted.length - 1];
      chartData[shortKey].push(item.values[key]);
    });
  });

  const itemNames = Object.keys(chartData);

  return {
    customData: {
      legendItems: itemNames,
    },
    data: {
      columns: [chartData[itemNames[0]], chartData[itemNames[1]]],
      type: 'bar',
      order: null,
      groups: [itemNames],
      colors,
      onclick: isPreview ? null : onChartClick,
    },
    grid: {
      y: {
        show: !isPreview,
      },
    },
    axis: {
      x: {
        show: !isPreview,
        type: 'category',
        categories: itemsData.map((item) => {
          const day = moment(item.date)
            .format('dddd')
            .substring(0, 3);
          return `${day}, ${item.date}`;
        }),
        tick: {
          values: getTimelineAxisTicks(itemsData.length),
          width: 60,
          centered: true,
          inner: true,
          multiline: true,
          outer: false,
        },
      },
      y: {
        show: true,
        max: 100,
        padding: {
          top: 0,
        },
        label: {
          text: formatMessage(localMessages.yAxisInvestigationsTitle),
          position: 'outer-middle',
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
        isTimeline: true,
      }),
    },
    size,
  };
};
