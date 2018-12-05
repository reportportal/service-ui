import { redirect } from 'redux-first-router';
import isEqual from 'fast-deep-equal';

const mergeQuery = (oldQuery, paramsToMerge) => {
  const newQuery = { ...oldQuery, ...paramsToMerge };
  return Object.keys(newQuery).reduce(
    (acc, key) =>
      newQuery[key] === undefined || newQuery[key] === null
        ? acc
        : { ...acc, [key]: newQuery[key] },
    {},
  );
};

export const updatePagePropertiesAction = (properties) => (dispatch, getState) => {
  const {
    location: { type, payload, query },
  } = getState();

  const newQuery = mergeQuery(query, properties);

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
