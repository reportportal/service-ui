import { FETCH_SUCCESS, DEFAULT_OPTIONS } from './constants';

export const fetchReducer = (namespace, options = DEFAULT_OPTIONS) => (
  state = options.initialState || DEFAULT_OPTIONS.initialState,
  { type, payload, meta },
) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  const contentPath = options.contentPath || DEFAULT_OPTIONS.contentPath;
  switch (type) {
    case FETCH_SUCCESS:
      return contentPath ? payload[contentPath] : payload;
    default:
      return state;
  }
};
