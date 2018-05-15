import { FETCH_SUCCESS, DEFAULT_OPTIONS } from './constants';

const computeInitialState = (options) => {
  if (!Object.prototype.hasOwnProperty.call(options, 'initialState')) {
    return DEFAULT_OPTIONS.initialState;
  }
  return options.initialState;
};

export const fetchReducer = (namespace, options = DEFAULT_OPTIONS) => (
  state = computeInitialState(options),
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
