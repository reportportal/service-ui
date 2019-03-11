import {
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_LOG_PAGE,
  PROJECT_USERDEBUG_LOG_PAGE,
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
    const itemLevel = getItemLevel(item.type);
    if (!acc) {
      return itemLevel;
    }
    const prevLevel = getItemLevel(acc);
    return LEVELS[prevLevel] && LEVELS[prevLevel].order > LEVELS[itemLevel].order
      ? itemLevel
      : prevLevel;
  }, '');

export const getQueryNamespace = (levelIndex) => `item${levelIndex}`;

export const getNextPage = (currentLevel, debugMode) => {
  if (currentLevel === launchLevels.LEVEL_STEP) {
    return debugMode ? PROJECT_USERDEBUG_LOG_PAGE : PROJECT_LOG_PAGE;
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

export const normalizeTestItem = (testItem, defectTypesConfig = {}) => {
  if (!testItem) {
    return null;
  }
  const testItemDefects = (testItem.statistics && testItem.statistics.defects) || {};
  const defectStatistics = Object.keys(defectTypesConfig).reduce((result, key) => {
    const defectTypeName = key.toLowerCase();
    const testItemDefectType = testItemDefects[defectTypeName] || {};
    const newDefect = defectTypesConfig[key].reduce(
      (acc, defectTypeConfig) => ({
        ...acc,
        [defectTypeConfig.locator]: testItemDefectType[defectTypeConfig.locator] || 0,
      }),
      { total: testItemDefectType.total || 0 },
    );
    return { ...result, [defectTypeName]: newDefect };
  }, {});
  return {
    ...testItem,
    statistics: {
      ...(testItem.statistics || {}),
      defects: defectStatistics,
    },
  };
};
