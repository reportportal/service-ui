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

import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import * as COLORS from 'common/constants/colors';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { getTimeType, convertSecondsToMilliseconds } from 'components/widgets/common/utils';
import { DURATION } from 'components/widgets/common/constants';
import { messages } from 'components/widgets/common/messages';
import { MostTimeConsumingTestCasesTooltip } from './mostTimeConsumingTestCasesTooltip';
import { calculateTooltipParams } from './utils';

export const getConfig = ({ content, formatMessage, positionCallback, size, onChartClick }) => {
  const chartData = [DURATION];
  let maxDuration = 0;
  const itemsData = content.map((item) => {
    const duration = convertSecondsToMilliseconds(item.duration);
    maxDuration = duration > maxDuration ? duration : maxDuration;
    chartData.push(duration);

    return { ...item, duration };
  });
  const timeType = getTimeType(maxDuration);

  const getItemColor = (color, { index }) => {
    const status = itemsData[index] && itemsData[index].status;

    return COLORS[`COLOR_${status}`];
  };

  const dataClickHandler = ({ index }) => {
    const targetItem = itemsData[index] || {};

    onChartClick(targetItem.id);
  };

  return {
    data: {
      columns: [chartData],
      type: MODES_VALUES[CHART_MODES.BAR_VIEW],
      color: getItemColor,
      onclick: dataClickHandler,
    },
    bar: {
      width: {
        ratio: 0.8,
      },
    },
    grid: {
      x: {
        show: true,
      },
    },
    axis: {
      rotated: true,
      x: {
        show: false,
      },
      y: {
        show: true,
        tick: {
          format: (d) => (parseInt(d, 10) / timeType.value).toFixed(2),
        },
        padding: {
          top: 0,
          bottom: 0,
        },
        label: {
          text: formatMessage(messages[timeType.type]),
          position: 'outer-center',
        },
      },
    },
    interaction: {
      enabled: true,
    },
    padding: {
      top: 40,
      left: 35,
      right: 10,
      bottom: 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(MostTimeConsumingTestCasesTooltip, calculateTooltipParams, {
        itemsData,
      }),
    },
    point: {
      show: false,
    },
    size,
  };
};
