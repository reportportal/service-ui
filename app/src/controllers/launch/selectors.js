const launchesSelector = (state) => state.launches || {};

export const selectedLaunchesSelector = (state) => launchesSelector(state).selected;
export const validationErrorsSelector = (state) => launchesSelector(state).errors;
export const lastOperationSelector = (state) => launchesSelector(state).lastOperation;
