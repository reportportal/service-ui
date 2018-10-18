import {
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  FETCH_LAUNCHES_FILTERS,
  CHANGE_ACTIVE_FILTER,
  UPDATE_FILTER_ENTITIES,
} from './constants';

export const fetchFiltersAction = (params) => ({
  type: FETCH_FILTERS,
  payload: params,
});

export const fetchFiltersConcatAction = (params) => ({
  type: FETCH_FILTERS_CONCAT,
  payload: params,
});

export const fetchLaunchesFiltersAction = () => ({
  type: FETCH_LAUNCHES_FILTERS,
});

export const changeActiveFilterAction = (filterId) => ({
  type: CHANGE_ACTIVE_FILTER,
  payload: filterId,
});

export const updateFilterEntitiesAction = (filterId, entities) => ({
  type: UPDATE_FILTER_ENTITIES,
  payload: {
    filterId,
    entities,
  },
});
