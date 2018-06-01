const domainSelector = (state) => state.itemsHistory || {};
export const itemsHistorySelector = (state) => domainSelector(state).items;
export const historySelector = (state) => domainSelector(state).history.reverse();
export const visibleItemsCountSelector = (state) => domainSelector(state).visibleItemsCount;
export const loadingSelector = (state) => domainSelector(state).loading;
