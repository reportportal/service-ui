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

import { COLOR_CHARCOAL_GREY, COLOR_GRAY_80 } from 'common/constants/colors';
import {
  buildAxisTicks,
  buildTooltipFormatter,
} from 'components/widgets/common/echarts/configHelpers';
import { transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { COLORS } from 'components/widgets/common/constants';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { calculateTooltipParams, localMessages } from './utils';

const AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

export const getLaunchModeOption = ({ content, isPreview, formatMessage }) => {
  const sortedResult = [...content].sort((a, b) => {
    const startTimeA = new Date(a.startTime);
    const startTimeB = new Date(b.startTime);
    return startTimeA - startTimeB;
  });
  const itemsData = sortedResult.map((item) => ({
    id: item.id,
    name: item.name,
    number: item.number,
    startTime: item.startTime,
  }));
  const groups = Object.keys(sortedResult[0].values);
  const colors = {};
  const categories = itemsData.map(transformCategoryLabelByDefault);
  const tickValues = buildAxisTicks(itemsData.length);

  const series = groups.map((type) => {
    colors[type] = COLORS[type];

    return {
      id: type,
      name: type,
      type: 'bar',
      stack: 'total',
      data: sortedResult.map((item) => Number.parseFloat(item.values[type] || 0)),
      barWidth: '60%',
      barCategoryGap: '40%',
      itemStyle: {
        color: COLORS[type],
      },
      emphasis: {
        focus: 'none',
        itemStyle: {
          opacity: 0.75,
        },
      },
    };
  });

  return {
    color: groups.map((type) => colors[type]),
    textStyle: AXIS_LABEL_STYLE,
    grid: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: isPreview ? 0 : 40,
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
          color: COLOR_GRAY_80,
          width: 1,
        },
      },
      axisTick: {
        show: false,
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
      name: isPreview ? undefined : formatMessage(localMessages.yAxisInvestigationsTitle),
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
      trigger: 'item',
      show: !isPreview,
      formatter: buildTooltipFormatter(IssueTypeStatTooltip, calculateTooltipParams, {
        itemsData,
        formatMessage,
      }),
    },
    legend: {
      show: false,
    },
    series,
    customData: {
      itemsData,
      colors,
      legendItems: groups,
    },
  };
};
