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

import { COLOR_GRAY_80 } from 'common/constants/colors';
import { AXIS_LABEL_STYLE } from './stackedBarSeries';

export const buildCategoryXAxis = ({
  show,
  data,
  boundaryGap = true,
  onZero = false,
  axisLabelInterval = 0,
  name,
  nameGap = 22,
  axisLineColor = COLOR_GRAY_80,
  showAxisTick = false,
  axisTickColor = COLOR_GRAY_80,
  axisTickLength = 4,
}) => ({
  type: 'category',
  show,
  data,
  boundaryGap,
  axisLine: {
    show: true,
    ...(onZero ? { onZero: true } : {}),
    lineStyle: {
      color: axisLineColor,
      width: 1,
    },
  },
  axisTick: {
    show: showAxisTick,
    ...(showAxisTick
      ? {
          interval: 0,
          alignWithLabel: true,
          inside: false,
          length: axisTickLength,
          lineStyle: {
            color: axisTickColor,
            width: 1,
          },
        }
      : {}),
  },
  axisLabel: {
    ...AXIS_LABEL_STYLE,
    margin: 8,
    interval: axisLabelInterval,
    hideOverlap: true,
  },
  ...(name
    ? {
        name,
        nameLocation: 'middle',
        nameGap,
        nameTextStyle: AXIS_LABEL_STYLE,
      }
    : {}),
});

export const buildValueYAxis = ({
  show,
  min = 0,
  max = 100,
  interval = 10,
  name,
  nameGap = 32,
  axisLabel = {},
}) => ({
  type: 'value',
  show,
  min,
  max,
  interval,
  ...(name
    ? {
        name,
        nameLocation: 'middle',
        nameGap,
        nameRotate: 90,
        nameTextStyle: {
          ...AXIS_LABEL_STYLE,
          fontSize: 12,
        },
      }
    : {}),
  axisLabel: {
    ...AXIS_LABEL_STYLE,
    margin: 8,
    ...axisLabel,
  },
  axisLine: {
    show: false,
  },
  axisTick: {
    show: false,
  },
  splitLine: {
    show,
    lineStyle: {
      color: COLOR_GRAY_80,
      width: 1,
    },
  },
});

export const buildItemTooltip = ({ show, formatter }) => ({
  trigger: 'item',
  show,
  formatter,
});

export const buildAxisTooltip = ({ show, formatter }) => ({
  trigger: 'axis',
  show,
  formatter,
});
