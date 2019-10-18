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
import * as COLORS from 'common/constants/colors';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import {
  getLaunchAxisTicks,
  getTimelineAxisTicks,
  normalizeChartData,
} from 'components/widgets/common/utils';
import { messages } from 'components/widgets/common/messages';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { TestCasesGrowthTrendChartTooltip } from './testCasesGrowthTrendChartTooltip';
import { calculateTooltipParams } from './utils';

export const getConfig = ({
  content,
  size,
  isPreview,
  positionCallback,
  formatMessage,
  onRendered,
  isTimeline,
  onChartClick,
}) => {
  const data = normalizeChartData(content, isTimeline);
  const itemsData = [];
  const offsets = ['offset'];
  const bars = ['bar'];
  const positiveTrend = [];

  data.forEach((item) => {
    const { values, ...itemInfo } = item;
    if (+values.delta < 0) {
      positiveTrend.push(false);
      offsets.push(+values.statistics$executions$total);
    } else {
      positiveTrend.push(true);
      offsets.push(+values.statistics$executions$total - +values.delta);
    }
    bars.push(Math.abs(+values.delta));

    itemsData.push(itemInfo);
  });

  return {
    data: {
      columns: [offsets, bars],
      type: MODES_VALUES[CHART_MODES.BAR_VIEW],
      order: null,
      groups: [['offset', 'bar']],
      onclick: isPreview ? null : onChartClick,
      color: (c, d) => {
        let color;
        switch (d.id) {
          case 'bar':
            if (positiveTrend[d.index]) {
              color = COLORS.COLOR_DARK_PASTEL_GREEN;
              break;
            }
            color = COLORS.COLOR_ORANGE_RED;
            break;
          default:
            color = null;
            break;
        }
        return color;
      },
      labels: {
        format: (v, id, i) => {
          let step = itemsData.length < 20 ? 1 : 2;
          if (isTimeline && itemsData.length >= 20) {
            step = 6;
          }

          if (isPreview || id !== 'bar' || i % step !== 0) {
            return null;
          }
          return positiveTrend[i] ? v : -v;
        },
      },
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
          let day;
          if (isTimeline) {
            day = moment(item.date)
              .format('dddd')
              .substring(0, 3);
            return `${day}, ${item.date}`;
          }
          return `#${item.number}`;
        }),
        tick: {
          values: isTimeline
            ? getTimelineAxisTicks(itemsData.length)
            : getLaunchAxisTicks(itemsData.length),
          width: 60,
          centered: true,
          inner: true,
          outer: false,
          multiline: isTimeline,
        },
      },
      y: {
        show: !isPreview,
        padding: {
          top: 10,
          bottom: 0,
        },
        label: {
          text: `${formatMessage(messages.cases)}`,
          position: 'outer-middle',
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 10,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: isPreview || !isTimeline ? 0 : 10,
    },
    legend: {
      show: false,
    },
    size,
    tooltip: {
      grouped: true,
      position: positionCallback,
      contents: createTooltipRenderer(TestCasesGrowthTrendChartTooltip, calculateTooltipParams, {
        itemsData,
        positiveTrend,
        isTimeline,
        formatMessage,
      }),
    },
    onrendered: onRendered,
  };
};
