import { createSelector } from 'reselect';
import {
  createValidationErrorsSelector,
  createSelectedItemsSelector,
  createLastOperationSelector,
} from 'controllers/groupOperations';
import {
  createQueryParametersSelector,
  PROJECT_LAUNCHES_PAGE,
  projectIdSelector,
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

const createLaunchesLinkSelector = (filterId) =>
  createSelector(projectIdSelector, (projectId) => ({
    type: PROJECT_LAUNCHES_PAGE,
    payload: {
      projectId,
      filterId,
    },
  }));

export const allLaunchesLikSelector = createLaunchesLinkSelector(ALL);
export const latestLaunchesLinkSelector = createLaunchesLinkSelector(LATEST);
