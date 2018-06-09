import { FETCH_TEST_ITEMS, SET_LEVEL } from './constants';

export const setLevelAction = (level) => ({
  type: SET_LEVEL,
  payload: level,
});

export const fetchTestItemsAction = () => ({
  type: FETCH_TEST_ITEMS,
});
