import { combineReducers } from 'redux';
import { loadingReducer } from 'controllers/loading';
import { SET_LEVEL, NAMESPACE } from './constants';

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
});
