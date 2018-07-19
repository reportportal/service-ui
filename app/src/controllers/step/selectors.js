const domainSelector = (state) => state.step;

export const stepsSelector = (state) => domainSelector(state).steps;
