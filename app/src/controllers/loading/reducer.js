import { FETCH_START, FETCH_SUCCESS } from 'controllers/fetch';

export const loadingReducer = (namespace) => (state = false, { type, meta }) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case FETCH_START:
      return true;
    case FETCH_SUCCESS:
      return false;
    default:
      return state;
  }
};
