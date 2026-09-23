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

export const createStackedBarSeries = (itemNames, dataByName, colors) =>
  itemNames.map((name) => ({
    id: name,
    name,
    type: 'bar',
    stack: 'total',
    data: dataByName[name],
    barWidth: '60%',
    barCategoryGap: '40%',
    itemStyle: {
      color: colors[name],
    },
    emphasis: STACKED_BAR_EMPHASIS,
  }));
