import { pagePropertiesSelector } from 'controllers/pages';
import { SORTING_KEY } from './constants';

export const sortingStringSelector = (state, namespace) =>
  pagePropertiesSelector(state, namespace)[SORTING_KEY] || '';
