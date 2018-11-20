import { PASSED, FAILED, MANY, NOT_FOUND } from 'common/constants/launchStatuses';

const validForGrowthDuration = (item) =>
  item.status === FAILED.toUpperCase() || item.status === PASSED.toUpperCase();

export const calculateGrowthDuration = (historyItems) => {
  const historyItemsLastIndex = historyItems.length - 1;
  return historyItems
    .reverse()
    .map((item, index) => {
      if (!validForGrowthDuration(item) || index >= historyItemsLastIndex) {
        return item;
      }

      const newItem = { ...item };
      let prevItemIndex = index + 1;
      while (
        !validForGrowthDuration(historyItems[prevItemIndex]) &&
        prevItemIndex < historyItemsLastIndex
      ) {
        prevItemIndex += 1;
      }
      if (prevItemIndex <= historyItemsLastIndex) {
        const prevDuration =
          historyItems[prevItemIndex].end_time - historyItems[prevItemIndex].start_time;
        const currentDuration = item.end_time - item.start_time;
        const growth = currentDuration / prevDuration - 1;
        growth > 0 && (newItem.growthDuration = `+${Math.round(growth * 100)}%`);
      }
      return newItem;
    })
    .reverse();
};

export const normalizeHistoryItem = (historyItem, filteredSameHistoryItems) => {
  const itemProps = {
    launchNumber: historyItem.launchNumber,
    ...filteredSameHistoryItems[0],
  };

  if (!filteredSameHistoryItems.length) {
    itemProps.status = NOT_FOUND.toUpperCase();
  } else if (filteredSameHistoryItems.length > 1) {
    itemProps.status = MANY.toUpperCase();
    delete itemProps.issue;
    delete itemProps.statistics;
  }
  return itemProps;
};

export const getPreviousItem = (testItems = [], currentId) => {
  if (testItems.length < 2) {
    return null;
  }
  const itemIndex = testItems.findIndex((item) => item.id === currentId);
  return testItems[itemIndex - 1] || null;
};

export const getNextItem = (testItems = [], currentId) => {
  if (testItems.length < 2) {
    return null;
  }
  const itemIndex = testItems.findIndex((item) => item.id === currentId);
  return testItems[itemIndex + 1] || null;
};
