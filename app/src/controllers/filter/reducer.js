import { combineReducers } from 'redux';
import { fetchReducer, FETCH_SUCCESS } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { queueReducers } from 'common/utils/queueReducers';
import {
  NAMESPACE,
  LAUNCHES_FILTERS_NAMESPACE,
  UPDATE_FILTER_ENTITIES,
  ADD_FILTER,
  UPDATE_FILTER_SUCCESS,
  REMOVE_FILTER,
} from './constants';

const updateFilter = (filters, filter, oldId) => {
  const id = oldId || filter.id;
  const filterIndex = filters.findIndex((item) => item.id === id);
  if (filterIndex === -1) {
    return [...filters, filter];
  }
  const newFilters = [...filters];
  newFilters.splice(filterIndex, 1, filter);
  return newFilters;
};

const updateFilterEntities = (filters, filterId, entities) => {
  const filter = filters.find((item) => item.id === filterId);
  return updateFilter(filters, { ...filter, entities });
};

const launchFilterLoadedReducer = (state = false, { type, meta }) => {
  if (meta && meta.namespace && meta.namespace !== LAUNCHES_FILTERS_NAMESPACE) {
    return state;
  }
  switch (type) {
    case FETCH_SUCCESS:
      return true;
    default:
      return state;
  }
};

export const launchesFiltersReducer = (state = [], { type, payload, meta: { oldId } = {} }) => {
  switch (type) {
    case UPDATE_FILTER_ENTITIES:
      return updateFilterEntities(state, payload.filterId, payload.entities);
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

export const savedLaunchesFiltersReducer = (
  state = [],
  { type, payload, meta: { oldId } = {} },
) => {
  switch (type) {
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
  launchesFilters: queueReducers(fetchReducer(LAUNCHES_FILTERS_NAMESPACE), launchesFiltersReducer),
  savedLaunchesFilters: queueReducers(
    fetchReducer(LAUNCHES_FILTERS_NAMESPACE),
    savedLaunchesFiltersReducer,
  ),
  launchFiltersLoaded: launchFilterLoadedReducer,
});
