import { combineReducers } from 'redux';
import { FETCH_SUCCESS } from 'controllers/fetch';
import { NAMESPACE, SET_ITEMS_HISTORY, SET_VISIBLE_ITEMS_COUNT, RESET_HISTORY } from './constants';

const itemsReducer = (state = [], { type, payload }) => {
  switch (type) {
    case SET_ITEMS_HISTORY:
      return payload;
    default:
      return state;
  }
};

const visibleItemsCountReducer = (state = 0, { type, payload }) => {
  switch (type) {
    case SET_VISIBLE_ITEMS_COUNT:
      return payload;
    case RESET_HISTORY:
      return 0;
    default:
      return state;
  }
};

const historyReducer = (state = [], { type, payload, meta }) => {
  if (meta && meta.namespace && meta.namespace !== NAMESPACE) {
    return state;
  }
  let newItemsHistory;
  let reversedPayload;
  switch (type) {
    case FETCH_SUCCESS:
      if (state.length === 0) {
        return payload.reverse();
      }
      reversedPayload = payload.reverse();
      newItemsHistory = state.map((item, index) => ({
        ...item,
        resources: item.resources.concat(
          reversedPayload[index] && reversedPayload[index].resources,
        ),
      }));
      return newItemsHistory;
    case RESET_HISTORY:
      return [];
    default:
      return state;
  }
};

export const itemsHistoryReducer = combineReducers({
  history: historyReducer,
  items: itemsReducer,
  visibleItemsCount: visibleItemsCountReducer,
});
