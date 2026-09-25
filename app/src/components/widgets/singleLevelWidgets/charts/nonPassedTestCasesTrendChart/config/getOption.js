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
  COLOR_FAILEDSKIPPEDTOTAL,
  COLOR_GRAY_80,
} from 'common/constants/colors';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from './utils';

const localMessages = defineMessages({
  nonPassedCases: {
    id: 'NonPassedTestCasesTrendChart.nonPassedCases',
    defaultMessage: 'of non-passed cases',
  },
});

const FAILED_SKIPPED_TOTAL = '% (Failed+Skipped)/Total';
const SERIES_ID = 'notPassed';

const AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

export const getOption = ({ content, isPreview, formatMessage }) => {
  const itemsData = [];
  const values = [];

  content.forEach((item) => {
    const { id, name, number, startTime } = item;
    itemsData.push({ id, name, number, startTime });
    values.push(Number.parseFloat(item.values[FAILED_SKIPPED_TOTAL]));
  });

  const categories = itemsData.map((item) => `# ${item.number}`);
  const tickValues = buildAxisTicks(itemsData.length);
  const singlePoint = itemsData.length === 1;

  return {
    color: [COLOR_FAILEDSKIPPEDTOTAL],
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
      min: 0,
      max: 100,
      interval: 10,
      name: isPreview ? undefined : `% ${formatMessage(localMessages.nonPassedCases)}`,
      nameLocation: 'middle',
      nameGap: 32,
      nameRotate: 90,
      nameTextStyle: {
        ...AXIS_LABEL_STYLE,
        fontSize: 12,
      },
      axisLabel: {
        ...AXIS_LABEL_STYLE,
        margin: 8,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
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
        showSymbol: true,
        symbolSize: singlePoint ? 10 : 2,
        lineStyle: {
          width: 1,
        },
        emphasis: {
          scale: 4,
          itemStyle: {
            borderWidth: 2,
          },
        },
        triggerLineEvent: true,
        cursor: isPreview ? 'default' : 'pointer',
        silent: isPreview,
      },
    ],
    customData: {
      itemsData,
      colors: {
        [SERIES_ID]: COLOR_FAILEDSKIPPEDTOTAL,
      },
      legendItems: [SERIES_ID],
    },
  };
};
