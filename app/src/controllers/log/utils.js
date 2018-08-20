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

export const getHistoryItemProps = (filteredLaunchHistoryItem) => {
  const itemProps = { ...filteredLaunchHistoryItem[0] };

  if (!filteredLaunchHistoryItem.length) {
    itemProps.status = NOT_FOUND.toUpperCase();
  } else if (filteredLaunchHistoryItem.length > 1) {
    itemProps.status = MANY.toUpperCase();
    delete itemProps.issue;
    delete itemProps.statistics;
  }
  return itemProps;
};
