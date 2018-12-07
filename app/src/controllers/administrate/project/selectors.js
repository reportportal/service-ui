import { administrateDomainSelector } from '../selectors';

export const projectSelector = (state) => administrateDomainSelector(state).project || {};
