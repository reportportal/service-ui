import {
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
} from 'controllers/pages';
import * as launchLevels from 'common/constants/launchLevels';
import * as methodTypes from 'common/constants/methodTypes';
import { LEVELS } from './levels';

const getItemLevel = (type) => {
  if (!launchLevels[`LEVEL_${type}`] && methodTypes[type]) {
    return launchLevels.LEVEL_STEP;
  }
  return type;
};

export const calculateLevel = (data) =>
  data.reduce((acc, item) => {
    if (!acc) {
      return item.type;
    }
    const itemLevel = getItemLevel(item.type);
    const prevLevel = getItemLevel(acc);
    return LEVELS[prevLevel] && LEVELS[prevLevel].order > LEVELS[itemLevel].order
      ? itemLevel
      : prevLevel;
  }, '');

export const getQueryNamespace = (levelIndex) => `item${levelIndex}`;

export const getNextPage = (currentLevel, debugMode) => {
  if (currentLevel === launchLevels.LEVEL_STEP) {
    return PROJECT_LOG_PAGE;
  }
  return debugMode ? PROJECT_USERDEBUG_TEST_ITEM_PAGE : TEST_ITEM_PAGE;
};

export const createLink = (testItemIds, itemId, payload, query, nextPage) => {
  let newTestItemsParam = testItemIds;
  if (itemId) {
    newTestItemsParam = testItemIds ? `${testItemIds}/${itemId}` : itemId;
  }
  return {
    type: nextPage,
    payload: {
      ...payload,
      testItemIds: newTestItemsParam,
    },
    meta: {
      query,
    },
  };
};

export const getDefectsString = (defects) =>
  defects && defects.filter((k) => k !== 'total').join(',');
