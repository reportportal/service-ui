import { redirect } from 'redux-first-router';

export const updatePagePropertiesAction = (properties) => (dispatch, getState) => {
  const {
    location: { type, payload, query },
  } = getState();

  const updatedAction = {
    type,
    payload,
    meta: { query: { ...query, ...properties } },
  };

  dispatch(redirect(updatedAction));
};
