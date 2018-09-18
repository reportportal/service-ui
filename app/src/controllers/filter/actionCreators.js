import { FETCH_FILTERS, FETCH_FILTERS_CONCAT } from './constants';

export const fetchFiltersAction = (params) => ({
  type: FETCH_FILTERS,
  payload: params,
});

export const fetchFiltersConcatAction = (params) => ({
  type: FETCH_FILTERS_CONCAT,
  payload: params,
});
