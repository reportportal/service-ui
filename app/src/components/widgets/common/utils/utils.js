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

import moment from 'moment/moment';
import * as COLORS from 'common/constants/colors';
import { ENTITY_START_TIME, CONDITION_BETWEEN } from 'components/filterEntities/constants';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { messages } from '../messages';

export const DEFECTS = 'defects';

export const range = (start = 0, end = 0, step = 1) => {
  const result = [];
  let index = 0;
  for (let tick = start; tick < end; tick += step) {
    result[index] = tick;
    index += 1;
  }
  return result;
};

export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const transformCategoryLabelByDefault = (item) => `#${item.number}`;

export const getItemNameConfig = (name) => {
  const nameParts = name.split('$');

  if (nameParts.length === 1) {
    return {};
  }

  return {
    itemType: nameParts[1],
    defectType: nameParts[2],
    locator: nameParts[3],
  };
};

export const getDefectTypeLocators = ({ defectType, locator }, defectTypes) => {
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  if (defectTypeConfig) {
    const existedTypeItem = defectTypeConfig.find((item) => item.locator === locator);
    return (
      (existedTypeItem && [existedTypeItem.locator]) || defectTypeConfig.map((item) => item.locator)
    );
  }
  return null;
};

export const getItemColor = (itemName, defectTypes) => {
  const { itemType, defectType, locator } = getItemNameConfig(itemName);

  if (itemType !== DEFECTS) {
    return COLORS[`COLOR_${defectType.toUpperCase()}`];
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).color ||
    defectTypeConfig[0].color
  );
};

export const getItemName = ({ itemName, defectTypes, formatMessage, noTotal = false }) => {
  const { itemType, defectType, locator } = getItemNameConfig(itemName);

  if (itemType !== DEFECTS) {
    return formatMessage(messages[defectType], { type: '' });
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  if (noTotal) {
    return defectTypeConfig[0].longName;
  }
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).longName ||
    formatMessage(messages.total, {
      type: defectTypeConfig[0].shortName,
    })
  );
};

export const getLaunchAxisTicks = (itemsLength) =>
  range(0, itemsLength, rangeMaxValue(itemsLength));

export const getTimelineAxisTicks = (itemsLength) =>
  range(
    itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0,
    itemsLength,
    itemsLength > 5 ? (itemsLength / 5).toFixed() : 1,
  );

export const getUpdatedFilterWithTime = (chartFilter, itemDate) => {
  const rangeMillisecond = 86400000;
  const time = moment(itemDate).valueOf();
  const filterEntityValue = `${time},${time + rangeMillisecond}`;
  const newCondition = {
    filteringField: ENTITY_START_TIME,
    value: filterEntityValue,
    condition: CONDITION_BETWEEN,
  };

  return {
    orders: chartFilter.orders,
    type: chartFilter.type,
    conditions: chartFilter.conditions.concat(newCondition),
  };
};

export const getChartDefaultProps = ({ isPreview, widget, container, observer, heightOffset }) => ({
  isPreview,
  widget,
  container,
  observer,
  heightOffset,
});

export const normalizeChartData = (data, isTimeLine) =>
  isTimeLine
    ? Object.keys(data).map((item) => ({
        date: item,
        values: data[item].values,
      }))
    : data;

export const getDefaultTestItemLinkParams = (projectId, filterId, testItemIds) => ({
  payload: {
    projectId,
    filterId,
    testItemIds,
  },
  type: TEST_ITEM_PAGE,
});
