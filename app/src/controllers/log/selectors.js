import { createSelector } from 'reselect';
import { calculateGrowthDuration, getHistoryItemProps } from './utils';

const logSelector = (state) => state.log || {};

const logEntriesSelector = (state) => logSelector(state).logEntries || [];

const itemToGetHistorySelector = (state) => logSelector(state).itemToGetHistory || '';

export const activeItemIdSelector = (state) => logSelector(state).activeItemId || '';

export const historyItemsSelector = createSelector(
  logEntriesSelector,
  itemToGetHistorySelector,
  (entriesFromState, itemToGetHistory) => {
    if (!entriesFromState.length) return [];
    const entries = [...entriesFromState].reverse();

    const currentLaunch = entries.pop();
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === itemToGetHistory);
    const historyItems = entries.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...getHistoryItemProps(filteredSameHistoryItems),
        launchNumber: historyItem.launchNumber,
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    return calculateGrowthDuration(historyItems);
  },
);
