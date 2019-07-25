import { SET_INITIAL_DATA_READY, FETCH_INITIAL_DATA } from './constants';

export const fetchInitialDataAction = () => ({ type: FETCH_INITIAL_DATA });

export const setInitialDataReadyAction = () => ({
  type: SET_INITIAL_DATA_READY,
});
