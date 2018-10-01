import { redirect } from 'redux-first-router';
import isEqual from 'fast-deep-equal';

export const updatePagePropertiesAction = (properties) => (dispatch, getState) => {
  const {
    location: { type, payload, query },
  } = getState();

  const newQuery = { ...query, ...properties };

  if (isEqual(query, newQuery)) {
    return;
  }

  const updatedAction = {
    type,
    payload,
    meta: { query: newQuery },
  };

  dispatch(redirect(updatedAction));
};
