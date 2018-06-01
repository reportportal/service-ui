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

const historyReducer = (namespace) => (state = [], { type, payload, meta }) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  let newItemsHistory;
  switch (type) {
    case FETCH_SUCCESS:
      if (state.length === 0) {
        return payload;
      }
      newItemsHistory = state.map((item, index) => ({
        ...item,
        resources: item.resources.concat(payload[index] && payload[index].resources),
      }));
      return newItemsHistory;
    case RESET_HISTORY:
      return [];
    default:
      return state;
  }
};

export const itemsHistoryReducer = combineReducers({
  history: historyReducer(NAMESPACE),
  items: itemsReducer,
  visibleItemsCount: visibleItemsCountReducer,
});
