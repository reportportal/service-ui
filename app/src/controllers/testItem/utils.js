import { TEST_ITEM_PAGE } from 'controllers/pages';
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
    return LEVELS[acc] && LEVELS[acc].order > LEVELS[itemLevel].order ? itemLevel : acc;
  }, '');

export const getQueryNamespace = (levelIndex) => `item${levelIndex}`;

export const createLink = (testItemIds, itemId, payload, query) => {
  const newTestItemsParam = testItemIds ? `${testItemIds}/${itemId}` : itemId;
  return {
    type: TEST_ITEM_PAGE,
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
