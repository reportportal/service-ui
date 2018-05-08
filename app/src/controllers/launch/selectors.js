const domainSelector = (state) => state.launches || {};

export const selectedLaunchesSelector = (state) => domainSelector(state).selected;
export const validationErrorsSelector = (state) => domainSelector(state).errors;
export const lastOperationSelector = (state) => domainSelector(state).lastOperation;

export const launchesSelector = (state) => domainSelector(state).launches;
export const launchPaginationSelector = (state) => domainSelector(state).pagination;
