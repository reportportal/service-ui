import { redirect } from 'redux-first-router';

export const updatePagePropertiesAction = (properties) => (dispatch, getState) => {
  const {
    location: { type, payload, meta },
  } = getState();

  const query = (meta && meta.query) || {};

  const updatedAction = {
    type,
    payload,
    meta: { ...meta, query: { ...query, ...properties } },
  };

  dispatch(redirect(updatedAction));
};
