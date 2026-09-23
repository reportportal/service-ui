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
import {
  COLOR_BLACK,
  COLOR_CHARCOAL_GREY,
  COLOR_FAILED,
  COLOR_GRAY_80,
} from 'common/constants/colors';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, getTicks } from './utils';

const localMessages = defineMessages({
  failedCasesLabel: {
    id: 'FailedCasesTrendChart.failedCases',
    defaultMessage: 'failed cases',
  },
});

const SERIES_ID = 'failed';

const AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

export const getOption = ({ content, isPreview, formatMessage }) => {
  const itemsData = [];
  const values = [];
  let topExtremum = 0;
  let bottomExtremum = Infinity;

  content.forEach((item) => {
    const { id, name, number, startTime } = item;
    const value = Number(item.values.total);
    if (value > topExtremum) {
      topExtremum = value;
    }
    if (value < bottomExtremum) {
      bottomExtremum = value;
    }
    itemsData.push({ id, name, number, startTime });
    values.push(value);
  });

  const categories = itemsData.map((item) => `# ${item.number}`);
  const tickValues = buildAxisTicks(itemsData.length);
  const yAxisTicks = getTicks(bottomExtremum, topExtremum);
  const singlePoint = itemsData.length === 1;

  return {
    color: [COLOR_FAILED],
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 95,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 30,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      show: !isPreview,
      data: categories,
      boundaryGap: true,
      axisLine: {
        show: true,
        onZero: true,
        lineStyle: {
          color: COLOR_BLACK,
          width: 1,
        },
      },
      axisTick: {
        show: true,
        interval: 0,
        alignWithLabel: true,
        inside: false,
        length: 6,
        lineStyle: {
          color: COLOR_BLACK,
          width: 1,
        },
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
        interval: (index) => tickValues.includes(index),
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      show: !isPreview,
      min: bottomExtremum,
      max: topExtremum,
      name: isPreview ? undefined : formatMessage(localMessages.failedCasesLabel),
      nameLocation: 'middle',
      nameGap: 24,
      nameRotate: 90,
      nameTextStyle: {
        ...AXIS_LABEL_STYLE,
        fontSize: 12,
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
        customValues: yAxisTicks,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
        customValues: yAxisTicks,
      },
      splitLine: {
        show: !isPreview,
        lineStyle: {
          color: COLOR_GRAY_80,
          width: 1,
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      show: !isPreview,
      formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
      }),
    },
    legend: {
      show: false,
    },
    series: [
      {
        id: SERIES_ID,
        name: SERIES_ID,
        type: 'line',
        data: values,
        showSymbol: singlePoint,
        symbolSize: singlePoint ? 10 : 2,
        lineStyle: {
          width: 1,
        },
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 2,
          },
        },
        triggerLineEvent: true,
      },
    ],
    customData: {
      itemsData,
      colors: {
        [SERIES_ID]: COLOR_FAILED,
      },
      legendItems: [SERIES_ID],
    },
  };
};
