import { DEFAULT_PAGINATION } from './constants';

export const totalElementsSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalElements;
export const totalPagesSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalPages;

export const defaultPaginationSelector = () => DEFAULT_PAGINATION;
