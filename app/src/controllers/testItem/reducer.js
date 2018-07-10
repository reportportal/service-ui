import { combineReducers } from 'redux';
import { loadingReducer } from 'controllers/loading';
import { fetchReducer } from 'controllers/fetch';
import { SET_LEVEL, NAMESPACE, PARENT_ITEMS_NAMESPACE } from './constants';

const levelReducer = (state = '', { type, payload }) => {
  switch (type) {
    case SET_LEVEL:
      return payload;
    default:
      return state;
  }
};

export const testItemReducer = combineReducers({
  level: levelReducer,
  loading: loadingReducer(NAMESPACE),
  parentItems: fetchReducer(PARENT_ITEMS_NAMESPACE, { initialState: [] }),
});
