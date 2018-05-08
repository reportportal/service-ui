import { fetchReducer } from 'controllers/fetch';

export const paginationReducer = (namespace) =>
  fetchReducer(namespace, { contentPath: 'page', initialState: {} });
