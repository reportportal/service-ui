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

import { buildAxisTicks } from 'components/widgets/common/echarts/configHelpers';
import { transformCategoryLabelByDefault } from 'components/widgets/common/utils';
import { buildInvestigatedChartOption } from './buildChartOption';
import { INVESTIGATED_COLORS } from './constants';

export const getLaunchModeData = (content) => {
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
  const itemNames = Object.keys(sortedResult[0].values);
  const colors = {};
  const dataByName = {};

  itemNames.forEach((type) => {
    colors[type] = INVESTIGATED_COLORS[type];
    dataByName[type] = sortedResult.map((item) => Number.parseFloat(item.values[type] || 0));
  });

  return {
    itemsData,
    itemNames,
    colors,
    dataByName,
    categories: itemsData.map(transformCategoryLabelByDefault),
    tickValues: buildAxisTicks(itemsData.length),
  };
};

export const getLaunchModeOption = ({
  content,
  isPreview,
  formatMessage,
  hiddenItems,
  legendHeight,
}) =>
  buildInvestigatedChartOption({
    ...getLaunchModeData(content),
    isPreview,
    formatMessage,
    hiddenItems,
    legendHeight,
    gridRight: 20,
  });
