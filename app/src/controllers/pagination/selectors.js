import { INITIAL_DATA } from './constants';

export const totalElementsSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalElements;
export const totalPagesSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalPages;

export const defaultPaginationSelector = () => INITIAL_DATA;
