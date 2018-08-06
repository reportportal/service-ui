import { pagePropertiesSelector } from 'controllers/pages';
import { DEFAULT_PAGINATION, PAGE_KEY, SIZE_KEY } from './constants';

export const totalElementsSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalElements;
export const totalPagesSelector = (paginationSelector) => (state) =>
  paginationSelector(state).totalPages;

export const pageNumberSelector = (state, namespace) => {
  const pageNumber = pagePropertiesSelector(state, namespace)[PAGE_KEY];
  return pageNumber !== undefined ? Number(pageNumber) : pageNumber;
};
export const sizeSelector = (state) => {
  const size = pagePropertiesSelector(state)[SIZE_KEY];
  return size !== undefined ? Number(size) : size;
};

export const defaultPaginationSelector = () => DEFAULT_PAGINATION;

export const paginationSelector = (state, namespace) => ({
  ...DEFAULT_PAGINATION,
  [PAGE_KEY]: pageNumberSelector(state, namespace),
  [SIZE_KEY]: sizeSelector(state),
});
