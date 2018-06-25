const domainSelector = (state) => state.members || {};

export const membersPaginationSelector = (state) => domainSelector(state).pagination;
export const membersSelector = (state) => domainSelector(state).members;
export const loadingSelector = (state) => domainSelector(state).loading || false;
