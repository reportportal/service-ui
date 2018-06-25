const domainSelector = (state) => state.filters || {};

export const filtersPaginationSelector = (state) => domainSelector(state).pagination;
export const filtersSelector = (state) => domainSelector(state).filters;
export const loadingSelector = (state) => domainSelector(state).loading || false;
