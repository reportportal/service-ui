import { TEST_ITEM_PAGE } from 'controllers/pages';
import { LEVELS } from './levels';

export const calculateLevel = (data) =>
  data.reduce((acc, item) => {
    if (!acc) {
      return item.type;
    }
    const type = item.type;
    return LEVELS[acc] && LEVELS[acc].order > LEVELS[type].order ? type : acc;
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
