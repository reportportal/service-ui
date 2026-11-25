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

import { COLOR_ALMOST_BLACK, COLOR_WHITE_TWO } from 'common/constants/colors';
import { BAR_SEGMENT_STYLE } from '../../../common/topRoundedBars';
import { TOTAL_FIELD, getStatusItems, getDefectItems } from './utils';

export const DEFECT_ROW_HEIGHT = 28;

const STATUS_BAR_RADIUS = [0, 2, 2, 0];
const DEFECT_BAR_RADIUS = [0, 2, 2, 0];
const DEFECT_BAR_HEIGHT = 12;
export const DEFECT_GAP = DEFECT_ROW_HEIGHT - DEFECT_BAR_HEIGHT;
export const getDefectsHeight = (rowsCount) =>
  Math.max(0, rowsCount * DEFECT_ROW_HEIGHT - DEFECT_GAP);
const DEFECT_TRACK_OFFSET = 152;
const DEFECT_VALUE_WIDTH = 32;
const DEFECT_MARKER_RADIUS = 5;
const DEFECT_NAME_OFFSET = 16;
const DEFECT_NAME_WIDTH = 124;
const DEFECT_FONT_FAMILY = 'Roboto';
const DEFECT_FONT_SIZE = 12;
const DEFECT_LINE_HEIGHT = 16;
const DEFECT_TEXT_TOP = (DEFECT_ROW_HEIGHT - DEFECT_LINE_HEIGHT) / 2;

export const getStatusOption = ({ content, separateInterrupted = false }) => {
  const values = content[0].values;
  const total = values[TOTAL_FIELD] || 1;
  const plottedItems = getStatusItems(values, separateInterrupted).filter(({ value }) => value > 0);
  const lastId = plottedItems[plottedItems.length - 1]?.id;

  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'value', max: total, show: false, splitLine: { show: false } },
    yAxis: { type: 'category', data: [''], show: false },
    tooltip: { show: false },
    series: plottedItems.map(({ id, value, color }) => ({
      id,
      name: id,
      type: 'bar',
      stack: 'executions',
      barWidth: '100%',
      label: { show: false },
      emphasis: { disabled: true },
      itemStyle: BAR_SEGMENT_STYLE,
      data: [
        {
          id,
          value,
          itemStyle: {
            color,
            borderRadius: id === lastId ? STATUS_BAR_RADIUS : 0,
          },
        },
      ],
    })),
  };
};

const buildDefectRowGraphics = (items) =>
  items.flatMap(({ key, name, value, color }, index) => {
    const rowTop = index * DEFECT_ROW_HEIGHT;

    return [
      {
        type: 'circle',
        silent: true,
        shape: {
          cx: DEFECT_MARKER_RADIUS,
          cy: rowTop + DEFECT_ROW_HEIGHT / 2,
          r: DEFECT_MARKER_RADIUS,
        },
        style: { fill: color },
        id: `${key}-marker`,
      },
      {
        type: 'text',
        silent: true,
        left: DEFECT_NAME_OFFSET,
        top: rowTop + DEFECT_TEXT_TOP,
        style: {
          text: name,
          width: DEFECT_NAME_WIDTH,
          overflow: 'truncate',
          ellipsis: '...',
          fill: COLOR_ALMOST_BLACK,
          fontFamily: DEFECT_FONT_FAMILY,
          fontSize: DEFECT_FONT_SIZE,
          lineHeight: DEFECT_LINE_HEIGHT,
        },
        id: `${key}-name`,
      },
      {
        type: 'text',
        silent: true,
        right: 0,
        top: rowTop + DEFECT_TEXT_TOP,
        style: {
          text: String(value),
          fill: COLOR_ALMOST_BLACK,
          fontFamily: DEFECT_FONT_FAMILY,
          fontSize: DEFECT_FONT_SIZE,
          lineHeight: DEFECT_LINE_HEIGHT,
          textAlign: 'right',
        },
        id: `${key}-value`,
      },
    ];
  });

export const getDefectsOption = ({
  content,
  formatMessage,
  contentFields,
  orderedContentFields,
  defectTypes,
}) => {
  const items = getDefectItems({
    values: content[0].values,
    orderedContentFields,
    contentFields,
    defectTypes,
    formatMessage,
  });
  const maxValue = Math.max(0, ...items.map(({ value }) => value)) || 1;

  return {
    grid: { left: DEFECT_TRACK_OFFSET, right: DEFECT_VALUE_WIDTH, top: 0, bottom: 0 },
    xAxis: { type: 'value', max: maxValue, show: false, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: items.map(({ key }) => key),
      show: false,
    },
    graphic: buildDefectRowGraphics(items),
    tooltip: { show: false },
    series: [
      {
        type: 'bar',
        barWidth: DEFECT_BAR_HEIGHT,
        label: { show: false },
        emphasis: { disabled: true },
        itemStyle: { borderColor: COLOR_WHITE_TWO, borderWidth: 0 },
        data: items.map((item) => ({
          id: item.key,
          value: item.value,
          itemStyle: { color: item.color, borderRadius: DEFECT_BAR_RADIUS },
        })),
      },
    ],
  };
};
