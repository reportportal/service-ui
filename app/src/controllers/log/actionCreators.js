import {
  FETCH_LOG_ENTRIES,
  CHANGE_ACTIVE_LOG_ITEM,
  SET_LOG_ITEM_TO_GET_HISTORY,
} from './constants';

export const fetchLogEntriesAction = () => ({
  type: FETCH_LOG_ENTRIES,
});

export const setLogItemToGetHistoryAction = (logItemId) => (dispatch) => {
  dispatch({
    type: SET_LOG_ITEM_TO_GET_HISTORY,
    payload: logItemId,
  });
  dispatch({
    type: CHANGE_ACTIVE_LOG_ITEM,
    payload: logItemId,
  });
};

export const changeActiveLogItemAction = (logItemId) => (dispatch) => {
  dispatch({
    type: CHANGE_ACTIVE_LOG_ITEM,
    payload: logItemId,
  });
};
