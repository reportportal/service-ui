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

import { COLOR_CHARCOAL_GREY } from 'common/constants/colors';

export const AXIS_LABEL_STYLE = {
  fontFamily: 'OpenSans',
  fontSize: 10,
  fontWeight: 400,
  color: COLOR_CHARCOAL_GREY,
};

export const STACKED_BAR_EMPHASIS = {
  focus: 'none',
  itemStyle: {
    opacity: 0.75,
  },
};

const DEFAULT_STACKED_BAR_WIDTH = '60%';
const DEFAULT_STACKED_BAR_CATEGORY_GAP = '40%';

/**
 * For a *stacked* bar (one column per category made of segments), `barWidth`
 * defaults to 60% of the category slot. For grouped (non-stacked) series it
 * must NOT default the same way: forcing every series to the same width
 * makes them overlap instead of sitting thin, side by side — so a grouped
 * caller passes its own `barWidth`/`barCategoryGap` (or leaves them unset to
 * let ECharts auto-divide the slot).
 */
export const createBarSeries = (
  itemNames,
  dataByName,
  colors,
  { stack, barMinHeight, barWidth, barCategoryGap, barGap } = {},
) => {
  const resolvedBarWidth = barWidth ?? (stack ? DEFAULT_STACKED_BAR_WIDTH : undefined);
  const resolvedBarCategoryGap =
    barCategoryGap ?? (stack ? DEFAULT_STACKED_BAR_CATEGORY_GAP : undefined);

  return itemNames.map((name) => ({
    id: name,
    name,
    type: 'bar',
    ...(stack ? { stack } : {}),
    ...(resolvedBarWidth !== undefined ? { barWidth: resolvedBarWidth } : {}),
    ...(resolvedBarCategoryGap !== undefined ? { barCategoryGap: resolvedBarCategoryGap } : {}),
    // `barGap` is the gap between series *within* the same category (e.g.
    // between each status's bar for one launch), distinct from
    // `barCategoryGap`, which is the gap between different launches.
    ...(barGap !== undefined ? { barGap } : {}),
    // A zero-value bar is otherwise invisible; `barMinHeight` renders it as a
    // flat sliver flush with the x-axis (using the series' own fill color),
    // instead of a bordered zero-height rect that reads as a bump above the axis.
    ...(barMinHeight !== undefined ? { barMinHeight } : {}),
    data: dataByName[name],
    itemStyle: {
      color: colors[name],
    },
    emphasis: STACKED_BAR_EMPHASIS,
  }));
};

export const createStackedBarSeries = (itemNames, dataByName, colors) =>
  createBarSeries(itemNames, dataByName, colors, { stack: 'total' });
