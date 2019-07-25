import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import {
  NAMESPACE,
  FETCH_USER_FILTERS_SUCCESS,
  UPDATE_FILTER_CONDITIONS,
  ADD_FILTER,
  UPDATE_FILTER_SUCCESS,
  REMOVE_FILTER,
} from './constants';
import { updateFilter } from './utils';

const updateFilterConditions = (filters, filterId, conditions) => {
  const filter = filters.find((item) => item.id === filterId);
  return updateFilter(filters, { ...filter, conditions });
};

export const launchesFiltersReducer = (state = [], { type, payload, meta: { oldId } = {} }) => {
  switch (type) {
    case FETCH_USER_FILTERS_SUCCESS:
      return payload;
    case UPDATE_FILTER_CONDITIONS:
      return updateFilterConditions(state, payload.filterId, payload.conditions);
    case UPDATE_FILTER_SUCCESS:
      return updateFilter(state, payload, oldId);
    case ADD_FILTER:
      return [...state, payload];
    case REMOVE_FILTER:
      return state.filter((filter) => filter.id !== payload);
    default:
      return state;
  }
};

export const filterReducer = combineReducers({
  filters: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  launchesFilters: launchesFiltersReducer,
});
