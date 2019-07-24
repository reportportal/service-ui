import { INITIAL_STATE } from './constants';

const domainSelector = (state) => state.log.nestedSteps || {};

export const nestedStepSelector = (state, id) => domainSelector(state)[id] || INITIAL_STATE;
