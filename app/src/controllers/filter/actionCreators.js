import {
  FETCH_FILTERS,
  FETCH_FILTERS_CONCAT,
  FETCH_LAUNCHES_FILTERS,
  CHANGE_ACTIVE_FILTER,
  UPDATE_FILTER_ENTITIES,
  UPDATE_FILTER,
  UPDATE_FILTER_SUCCESS,
  ADD_FILTER,
  CREATE_FILTER,
  SAVE_NEW_FILTER,
  RESET_FILTER,
  REMOVE_FILTER,
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

export const updateFilterAction = (filter) => ({
  type: UPDATE_FILTER,
  payload: filter,
});

export const resetFilterAction = (filterId) => ({
  type: RESET_FILTER,
  payload: filterId,
});

export const createFilterAction = (filter) => ({
  type: CREATE_FILTER,
  payload: filter,
});

export const removeFilterAction = (filterId) => ({
  type: REMOVE_FILTER,
  payload: filterId,
});

export const addFilterAction = (filter) => ({
  type: ADD_FILTER,
  payload: filter,
});

export const saveNewFilterAction = (filter) => ({
  type: SAVE_NEW_FILTER,
  payload: filter,
});

export const updateFilterSuccessAction = (filter, oldId) => ({
  type: UPDATE_FILTER_SUCCESS,
  payload: filter,
  meta: {
    oldId,
  },
});
