import { createSelector } from 'reselect';
import { logItemIdSelector, pagePropertiesSelector } from 'controllers/pages';
import { extractNamespacedQuery } from 'common/utils/routingUtils';
import { calculateGrowthDuration, normalizeHistoryItem } from './utils';
import { NAMESPACE } from './constants';

const logSelector = (state) => state.log || {};

const historyEntriesSelector = (state) => logSelector(state).historyEntries || [];

export const historyItemsSelector = createSelector(
  historyEntriesSelector,
  logItemIdSelector,
  (entriesFromState, logItemId) => {
    if (!entriesFromState.length) return [];
    const entries = [...entriesFromState].reverse();

    const currentLaunch = entries.pop();
    if (!currentLaunch) {
      return [];
    }
    const currentLaunchItem = currentLaunch.resources.find((item) => item.id === logItemId);
    if (!currentLaunchItem) {
      return [];
    }
    const historyItems = entries.map((historyItem) => {
      const filteredSameHistoryItems = historyItem.resources.filter(
        (item) => item.uniqueId === currentLaunchItem.uniqueId,
      );

      return {
        ...normalizeHistoryItem(historyItem, filteredSameHistoryItems),
      };
    });

    currentLaunchItem.launchNumber = currentLaunch.launchNumber;
    historyItems.push(currentLaunchItem);

    return calculateGrowthDuration(historyItems);
  },
);

export const activeLogIdSelector = createSelector(
  logItemIdSelector,
  pagePropertiesSelector,
  (logItemId, query) => {
    const namespacedQuery = extractNamespacedQuery(query, NAMESPACE);
    return namespacedQuery.history || logItemId;
  },
);
