import { combineReducers } from 'redux';
import { fetchReducer, FETCH_SUCCESS } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { queueReducers } from 'common/utils/queueReducers';
import { NAMESPACE, LAUNCHES_FILTERS_NAMESPACE, UPDATE_FILTER_ENTITIES } from './constants';

const updateFilterEntities = (filters, filterId, entities) => {
  const filterIndex = filters.findIndex((item) => item.id === filterId);
  if (filterIndex === -1) {
    return filters;
  }
  const newFilter = { ...filters[filterIndex], entities };
  const newFilters = [...filters];
  newFilters.splice(filterIndex, 1, newFilter);
  return newFilters;
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

export const launchesFiltersReducer = (state = [], { type, payload }) => {
  switch (type) {
    case UPDATE_FILTER_ENTITIES:
      return updateFilterEntities(state, payload.filterId, payload.entities);
    default:
      return state;
  }
};

export const filterReducer = combineReducers({
  filters: fetchReducer(NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  launchesFilters: queueReducers(fetchReducer(LAUNCHES_FILTERS_NAMESPACE), launchesFiltersReducer),
  launchFiltersLoaded: launchFilterLoadedReducer,
});
