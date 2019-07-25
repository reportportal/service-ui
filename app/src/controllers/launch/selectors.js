import { createSelector } from 'reselect';
import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';
import {
  createQueryParametersSelector,
  pagePropertiesSelector,
  payloadSelector,
  pageSelector,
} from 'controllers/pages';
import { ALL, LATEST } from 'common/constants/reservedFilterIds';
import { DEFAULT_SORTING, NAMESPACE } from './constants';

const domainSelector = (state) => state.launches || {};
const groupOperationsSelector = (state) => domainSelector(state).groupOperations;

export const selectedLaunchesSelector = createSelectedItemsSelector(groupOperationsSelector);
export const validationErrorsSelector = createValidationErrorsSelector(groupOperationsSelector);
export const lastOperationSelector = createLastOperationSelector(groupOperationsSelector);

export const launchesSelector = (state) => domainSelector(state).launches;
export const launchPaginationSelector = (state) => domainSelector(state).pagination;

export const loadingSelector = (state) => domainSelector(state).loading || false;

export const queryParametersSelector = createQueryParametersSelector({
  namespace: NAMESPACE,
  defaultSorting: DEFAULT_SORTING,
});

export const debugModeSelector = (state) => domainSelector(state).debugMode || false;
export const launchDistinctSelector = (state) => domainSelector(state).launchDistinct || ALL;

const createLaunchesLinkSelector = (filterId) =>
  createSelector(pageSelector, payloadSelector, pagePropertiesSelector, (page, payload, query) => ({
    type: page,
    payload: {
      ...payload,
      filterId,
    },
    meta: {
      query,
    },
  }));

export const launchesDistinctLinksSelectorsMap = {
  [ALL]: createLaunchesLinkSelector(ALL),
  [LATEST]: createLaunchesLinkSelector(LATEST),
};
