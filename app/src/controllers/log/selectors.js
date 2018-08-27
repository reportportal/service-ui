import { createSelector } from 'reselect';
import { testItemIdsArraySelector } from '../pages/selectors';
import { calculateGrowthDuration, clarifyHistoryItemPropsAccordingToStatus } from './utils';

const logSelector = (state) => state.log || {};

const historyEntriesSelector = (state) => logSelector(state).logEntries || [];

export const activeItemIdSelector = (state) => logSelector(state).activeItemId || '';

export const logItemIdSelector = createSelector(
  testItemIdsArraySelector,
  (itemIdsArray) => (itemIdsArray.length && itemIdsArray.pop()) || '',
);

export const historyItemsSelector = createSelector(
  historyEntriesSelector,
  logItemIdSelector,
  (entriesFromState, logItemId) => {
    if (!entriesFromState.length) return [];
    const entries = [...entriesFromState].reverse();

    const currentLaunch = entries.pop();
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === logItemId);
    const historyItems = entries.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...clarifyHistoryItemPropsAccordingToStatus(filteredSameHistoryItems),
        launchNumber: historyItem.launchNumber,
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    return calculateGrowthDuration(historyItems);
  },
);
