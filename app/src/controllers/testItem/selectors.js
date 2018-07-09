import { testItemIdsArraySelector, createQueryParametersSelector } from 'controllers/pages';
import { DEFAULT_SORTING } from './constants';

const domainSelector = (state) => state.testItem || {};

export const levelSelector = (state) => domainSelector(state).level;
export const loadingSelector = (state) => domainSelector(state).loading;
export const namespaceSelector = (state) => `item${testItemIdsArraySelector(state).length - 1}`;
export const queryParametersSelector = createQueryParametersSelector({
  defaultSorting: DEFAULT_SORTING,
});
