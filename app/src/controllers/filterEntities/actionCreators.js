import { TOGGLE_FILTER } from './constants';

export const toggleFilter = (id) => ({
  type: TOGGLE_FILTER,
  payload: id,
});
